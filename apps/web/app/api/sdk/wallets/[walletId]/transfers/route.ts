import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { agentWallets, transfers } from "@repo/db/schema";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";
import { TransferCreateBodySchema } from "../../../_lib/validators";

export async function POST(
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

    const body = await req.json();
    const parsed = TransferCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const {
      fromAddress,
      toAddress,
      amount,
      token,
      status,
      memo,
      policyId,
      policyVersion,
    } = parsed.data;

    const [transfer] = await db
      .insert(transfers)
      .values({
        walletId,
        teamId: auth.teamId,
        policyId,
        policyVersion,
        network: wallet.network,
        fromAddress,
        toAddress,
        amount: BigInt(amount),
        token,
        status,
        memo,
      })
      .returning({ id: transfers.id });

    return Response.json({ id: transfer!.id });
  } catch {
    return Errors.internal();
  }
}
