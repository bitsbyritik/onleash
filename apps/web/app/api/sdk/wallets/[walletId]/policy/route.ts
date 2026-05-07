import { NextRequest } from "next/server";
import { db, eq, and } from "@repo/db";
import { agentWallets, policies } from "@repo/db/schema";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { walletId } = await params;

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!wallet) return Errors.notFound("Wallet");
    if (wallet.teamId !== auth.teamId) return Errors.forbidden();

    const policy = await db.query.policies.findFirst({
      where: and(eq(policies.walletId, walletId), eq(policies.isActive, true)),
    });

    if (!policy) return Errors.notFound("Policy");

    return Response.json({
      id: policy.id,
      walletId: policy.walletId,
      dailyCap: policy.dailyCap.toString(),
      perVendorCap: policy.perVendorCap.toString(),
      approvalThreshold: policy.approvalThreshold.toString(),
      blocklist: policy.blocklist,
      allowlist: policy.allowlist,
      allowlistMode: policy.allowlistMode,
      notificationChannelIds: policy.notificationChannelIds,
      timezone: policy.timezone,
      version: policy.version,
      parentPolicyPda: policy.parentPolicyPda ?? null,
    });
  } catch {
    return Errors.internal();
  }
}
