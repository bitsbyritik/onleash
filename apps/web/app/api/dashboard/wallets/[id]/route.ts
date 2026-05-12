import { db, eq, and } from "@repo/db";
import { agentWallets, policies } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../../_lib/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const wallet = await db.query.agentWallets.findFirst({
    where: eq(agentWallets.id, id),
  });

  if (!wallet) return Response.json({ error: "Wallet not found" }, { status: 404 });
  if (wallet.teamId !== session.teamId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const policy = await db.query.policies.findFirst({
    where: and(eq(policies.walletId, id), eq(policies.isActive, true)),
  });

  return Response.json({
    wallet: {
      id: wallet.id,
      name: wallet.name,
      publicKey: wallet.publicKey,
      network: wallet.network,
      isActive: wallet.isActive,
      createdAt: wallet.createdAt.toISOString(),
      policy: policy ? {
        id: policy.id,
        dailyCap: policy.dailyCap.toString(),
        perVendorCap: policy.perVendorCap.toString(),
        approvalThreshold: policy.approvalThreshold.toString(),
        blocklist: policy.blocklist,
        allowlist: policy.allowlist,
        allowlistMode: policy.allowlistMode,
      } : null,
    },
  });
}
