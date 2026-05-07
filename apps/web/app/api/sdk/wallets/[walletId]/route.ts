import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { agentWallets } from "@repo/db/schema";
import { authenticate } from "../../_lib/auth";
import { Errors } from "../../_lib/errors";

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

    return Response.json({
      id: wallet.id,
      name: wallet.name,
      publicKey: wallet.publicKey,
      isVerified: wallet.lastActiveAt !== null,
      network: wallet.network,
    });
  } catch {
    return Errors.internal();
  }
}
