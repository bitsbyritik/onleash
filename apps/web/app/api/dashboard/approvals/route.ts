import { db, eq, and, desc } from "@repo/db";
import { approvals, transfers, agentWallets } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const rows = await db
    .select({
      id: approvals.id,
      status: approvals.status,
      expiresAt: approvals.expiresAt,
      createdAt: approvals.createdAt,
      resolvedAt: approvals.resolvedAt,
      transferId: transfers.id,
      amount: transfers.amount,
      token: transfers.token,
      toAddress: transfers.toAddress,
      memo: transfers.memo,
      walletId: agentWallets.id,
      walletName: agentWallets.name,
    })
    .from(approvals)
    .innerJoin(transfers, eq(approvals.transferId, transfers.id))
    .innerJoin(agentWallets, eq(transfers.walletId, agentWallets.id))
    .where(eq(agentWallets.teamId, session.teamId))
    .orderBy(desc(approvals.createdAt))
    .limit(50);

  return Response.json({
    approvals: rows.map((r) => ({
      id: r.id,
      status: r.status,
      expiresAt: r.expiresAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      resolvedAt: r.resolvedAt?.toISOString() ?? null,
      transfer: {
        id: r.transferId,
        amount: r.amount.toString(),
        token: r.token,
        toAddress: r.toAddress,
        memo: r.memo ?? null,
      },
      wallet: { id: r.walletId, name: r.walletName },
    })),
  });
}
