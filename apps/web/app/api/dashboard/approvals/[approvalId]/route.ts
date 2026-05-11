import { z } from "zod";
import { db, eq } from "@repo/db";
import { approvals, transfers, agentWallets } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../../_lib/session";

const ResolveSchema = z.object({
  action: z.enum(["approved", "rejected"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ approvalId: string }> },
) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const { approvalId } = await params;

  const parsed = ResolveSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "action must be approved or rejected" }, { status: 400 });
  }

  const approval = await db.query.approvals.findFirst({
    where: eq(approvals.id, approvalId),
  });
  if (!approval) return Response.json({ error: "Not found" }, { status: 404 });
  if (approval.status !== "pending") {
    return Response.json({ error: "Already resolved" }, { status: 409 });
  }

  const transfer = await db.query.transfers.findFirst({
    where: eq(transfers.id, approval.transferId),
  });
  const wallet = transfer
    ? await db.query.agentWallets.findFirst({ where: eq(agentWallets.id, transfer.walletId) })
    : null;

  if (!wallet || wallet.teamId !== session.teamId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .update(approvals)
    .set({ status: parsed.data.action, resolvedAt: new Date() })
    .where(eq(approvals.id, approvalId));

  return Response.json({ id: approvalId, status: parsed.data.action });
}
