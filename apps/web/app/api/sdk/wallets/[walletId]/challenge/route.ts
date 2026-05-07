import { NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { db, eq } from "@repo/db";
import { agentWallets, authNonces } from "@repo/db/schema";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";

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

    const challenge = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db.insert(authNonces).values({
      nonce: challenge,
      walletAddress: wallet.publicKey,
      expiresAt,
    });

    return Response.json({ challenge });
  } catch {
    return Errors.internal();
  }
}
