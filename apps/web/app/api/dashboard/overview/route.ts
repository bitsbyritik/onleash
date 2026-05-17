import { db, eq, and, inArray, count, desc } from "@repo/db";
import {
  agentWallets,
  approvals,
  policies,
  spendTracking,
  teams,
  transfers,
} from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  // Active network from workspace settings
  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
    columns: { defaultNetwork: true },
  });
  const network = team?.defaultNetwork ?? "devnet";

  // All wallets for this team + network (with active policy for cap)
  const walletRows = await db.query.agentWallets.findMany({
    where: and(
      eq(agentWallets.teamId, session.teamId),
      eq(agentWallets.network, network),
    ),
    with: {
      policies: { where: eq(policies.isActive, true), limit: 1 },
    },
  });

  const walletIds = walletRows.map((w) => w.id);
  const activeWallets = walletRows.filter((w) => w.isActive).length;

  if (walletIds.length === 0) {
    return Response.json({
      network,
      stats: { activeWallets: 0, totalWallets: 0, totalTransfers: 0, blockedTransfers: 0, pendingApprovals: 0, todaySpentLamports: "0" },
      recentTransfers: [],
      walletSpend: [],
    });
  }

  const todayStr = new Date().toISOString().split("T")[0]!;

  // Run all heavy queries in parallel
  const [
    totalResult,
    blockedResult,
    pendingResult,
    spendRows,
    recentRows,
  ] = await Promise.all([
    // total transfers
    db.select({ value: count() }).from(transfers).where(inArray(transfers.walletId, walletIds)),
    // blocked transfers
    db.select({ value: count() }).from(transfers).where(
      and(inArray(transfers.walletId, walletIds), eq(transfers.status, "blocked")),
    ),
    // pending approvals (join through transfers to scope by network)
    db.select({ value: count() })
      .from(approvals)
      .innerJoin(transfers, eq(approvals.transferId, transfers.id))
      .where(and(eq(approvals.status, "pending"), inArray(transfers.walletId, walletIds))),
    // today's spend per wallet
    db.query.spendTracking.findMany({
      where: and(inArray(spendTracking.walletId, walletIds), eq(spendTracking.date, todayStr)),
    }),
    // recent transfers (last 8)
    db.query.transfers.findMany({
      where: inArray(transfers.walletId, walletIds),
      orderBy: [desc(transfers.createdAt)],
      limit: 8,
      with: { wallet: { columns: { name: true } } },
    }),
  ]);

  // Sum today's spend across all wallets
  const todaySpentLamports = spendRows
    .reduce((acc, r) => acc + r.totalSpent, 0n)
    .toString();

  // Per-wallet spend data (only wallets with a policy so we have a cap)
  const spendByWallet = new Map(spendRows.map((r) => [r.walletId, r.totalSpent]));
  const walletSpend = walletRows
    .filter((w) => w.policies[0])
    .map((w) => ({
      walletId: w.id,
      walletName: w.name,
      todaySpentLamports: (spendByWallet.get(w.id) ?? 0n).toString(),
      dailyCapLamports: w.policies[0]!.dailyCap.toString(),
    }))
    .sort((a, b) => Number(BigInt(b.todaySpentLamports) - BigInt(a.todaySpentLamports)));

  return Response.json({
    network,
    stats: {
      activeWallets,
      totalWallets: walletRows.length,
      totalTransfers: totalResult[0]?.value ?? 0,
      blockedTransfers: blockedResult[0]?.value ?? 0,
      pendingApprovals: pendingResult[0]?.value ?? 0,
      todaySpentLamports,
    },
    recentTransfers: recentRows.map((t) => ({
      id: t.id,
      createdAt: t.createdAt.toISOString(),
      walletName: t.wallet?.name ?? "unknown",
      toAddress: t.toAddress,
      amount: t.amount.toString(),
      token: t.token,
      status: t.status,
      memo: t.memo ?? null,
    })),
    walletSpend,
  });
}
