import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { agentWallets, approvals, transfers } from "@repo/db/schema";
import { authenticate } from "../../_lib/auth";
import { Errors } from "../../_lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ approvalId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { approvalId } = await params;

    const approval = await db.query.approvals.findFirst({
      where: eq(approvals.id, approvalId),
    });

    if (!approval) return Errors.notFound("Approval");

    const transfer = await db.query.transfers.findFirst({
      where: eq(transfers.id, approval.transferId),
    });

    if (!transfer) return Errors.notFound("Transfer");

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, transfer.walletId),
    });

    if (!wallet || wallet.teamId !== auth.teamId) return Errors.forbidden();

    return Response.json({
      id: approval.id,
      status: approval.status,
      approvalPda: approval.approvalPda ?? null,
      approvedAt:
        approval.status === "approved" ? approval.resolvedAt?.toISOString() ?? null : null,
      rejectedAt:
        approval.status === "rejected" ? approval.resolvedAt?.toISOString() ?? null : null,
    });
  } catch {
    return Errors.internal();
  }
}
