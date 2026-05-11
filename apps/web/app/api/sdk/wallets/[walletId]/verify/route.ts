import { NextRequest } from "next/server";
import { db, eq, and, gt } from "@repo/db";
import { agentWallets, authNonces } from "@repo/db/schema";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";
import { VerifyBodySchema } from "../../../_lib/validators";

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
    const parsed = VerifyBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const { challenge, signature, publicKey } = parsed.data;

    if (publicKey !== wallet.publicKey) {
      return Errors.badRequest("Public key does not match wallet");
    }

    const nonceRecord = await db.query.authNonces.findFirst({
      where: and(
        eq(authNonces.nonce, challenge),
        eq(authNonces.walletAddress, wallet.publicKey),
        gt(authNonces.expiresAt, new Date()),
      ),
    });

    if (!nonceRecord || nonceRecord.usedAt) {
      return Errors.badRequest("Challenge invalid or expired");
    }

    const messageBytes = new TextEncoder().encode(challenge);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = bs58.decode(publicKey);

    const valid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );

    if (!valid) return Errors.badRequest("Invalid signature");

    await db.transaction(async (tx) => {
      await tx
        .update(authNonces)
        .set({ usedAt: new Date() })
        .where(eq(authNonces.id, nonceRecord.id));

      await tx
        .update(agentWallets)
        .set({ lastActiveAt: new Date() })
        .where(eq(agentWallets.id, walletId));
    });

    return Response.json({ verified: true });
  } catch {
    return Errors.internal();
  }
}
