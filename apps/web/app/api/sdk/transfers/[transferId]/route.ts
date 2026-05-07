import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { agentWallets, transfers } from "@repo/db/schema";
import { authenticate } from "../../_lib/auth";
import { Errors } from "../../_lib/errors";
import { TransferPatchBodySchema } from "../../_lib/validators";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ transferId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { transferId } = await params;

    const transfer = await db.query.transfers.findFirst({
      where: eq(transfers.id, transferId),
    });

    if (!transfer) return Errors.notFound("Transfer");

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, transfer.walletId),
    });

    if (!wallet || wallet.teamId !== auth.teamId) return Errors.forbidden();

    const body = await req.json();
    const parsed = TransferPatchBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const { status, signature, rawTransaction } = parsed.data;

    if (!status && !signature && !rawTransaction) {
      return Errors.badRequest("No fields to update");
    }

    await db
      .update(transfers)
      .set({
        ...(status && { status }),
        ...(signature && { signature }),
        ...(rawTransaction && { rawTransaction }),
      })
      .where(eq(transfers.id, transferId));

    return Response.json({ ok: true });
  } catch {
    return Errors.internal();
  }
}
