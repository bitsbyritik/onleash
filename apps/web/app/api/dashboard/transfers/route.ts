import { db, desc, eq, and, inArray } from "@repo/db";
import { agentWallets, teams, transfers } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
    columns: { defaultNetwork: true },
  });

  const network = team?.defaultNetwork ?? "devnet";

  // Only wallets on the active network
  const teamWallets = await db.query.agentWallets.findMany({
    where: and(
      eq(agentWallets.teamId, session.teamId),
      eq(agentWallets.network, network),
    ),
    columns: { id: true },
  });

  const walletIds = teamWallets.map((w) => w.id);

  if (walletIds.length === 0) {
    return Response.json({ network, transfers: [] });
  }

  const rows = await db.query.transfers.findMany({
    where: and(inArray(transfers.walletId, walletIds), eq(transfers.network, network)),
    orderBy: [desc(transfers.createdAt)],
    limit: 200,
    with: {
      wallet: { columns: { name: true } },
      violations: { columns: { rule: true }, limit: 1 },
    },
  });

  return Response.json({
    network,
    transfers: rows.map((t) => ({
      id: t.id,
      createdAt: t.createdAt.toISOString(),
      walletName: t.wallet?.name ?? "unknown",
      toAddress: t.toAddress,
      amount: t.amount.toString(),
      token: t.token,
      status: t.status,
      memo: t.memo ?? null,
      signature: t.signature ?? null,
      violationRule: t.violations[0]?.rule ?? null,
    })),
  });
}
