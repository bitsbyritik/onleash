import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { agentWallets, policyViolations } from "@repo/db/schema";
import { authenticate } from "../_lib/auth";
import { Errors } from "../_lib/errors";
import { ViolationBodySchema } from "../_lib/validators";

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const body = await req.json();
    const parsed = ViolationBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const {
      transferId,
      walletId,
      rule,
      message,
      attemptedAmount,
      limitAmount,
      sessionId,
    } = parsed.data;

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!wallet) return Errors.notFound("Wallet");
    if (wallet.teamId !== auth.teamId) return Errors.forbidden();

    const [violation] = await db
      .insert(policyViolations)
      .values({
        transferId,
        walletId,
        rule,
        message,
        attemptedAmount: BigInt(attemptedAmount),
        limitAmount: limitAmount !== undefined ? BigInt(limitAmount) : null,
        sessionId,
      })
      .returning({ id: policyViolations.id });

    return Response.json({ id: violation!.id });
  } catch {
    return Errors.internal();
  }
}
