import { NextRequest } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { db, and, eq } from "@repo/db";
import { agentWallets, policies } from "@repo/db/schema";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";
import { ChildWalletCreateBodySchema } from "../../../_lib/validators";

const PROGRAM_ID = new PublicKey(
  "6ufLBSxNADjAAS7NT5f9Phnvjxc2We7n7q8s9uKx5GBn",
);

function policyPda(agentWallet: string): string {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("policy"), new PublicKey(agentWallet).toBuffer()],
    PROGRAM_ID,
  );
  return pda.toBase58();
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { walletId } = await params;

    const body = await req.json();
    const parsed = ChildWalletCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    if (parsed.data.parentWalletId !== walletId) {
      return Errors.badRequest("Parent wallet mismatch");
    }

    const parentWallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!parentWallet) return Errors.notFound("Wallet");
    if (parentWallet.teamId !== auth.teamId) return Errors.forbidden();

    try {
      new PublicKey(parsed.data.publicKey);
    } catch {
      return Errors.badRequest("Invalid child public key");
    }

    const existingChild = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.publicKey, parsed.data.publicKey),
    });
    if (existingChild) {
      return Errors.badRequest("Wallet public key already exists");
    }

    const parentPolicy = await db.query.policies.findFirst({
      where: and(eq(policies.walletId, walletId), eq(policies.isActive, true)),
    });

    if (!parentPolicy) return Errors.notFound("Parent policy");

    const dailyCap = BigInt(parsed.data.dailyCap);
    const perVendorCap = BigInt(parsed.data.perVendorCap);
    const approvalThreshold = BigInt(parsed.data.approvalThreshold);

    if (dailyCap <= 0n || perVendorCap <= 0n || approvalThreshold <= 0n) {
      return Errors.badRequest("Policy caps must be greater than zero");
    }

    if (dailyCap > parentPolicy.dailyCap) {
      return Errors.badRequest("Child daily cap exceeds parent daily cap");
    }

    if (perVendorCap > parentPolicy.perVendorCap) {
      return Errors.badRequest(
        "Child per-vendor cap exceeds parent per-vendor cap",
      );
    }

    if (perVendorCap > dailyCap) {
      return Errors.badRequest("Per-vendor cap cannot exceed daily cap");
    }

    const parentPolicyPda =
      parentWallet.onChainPolicyAccount ?? policyPda(parentWallet.publicKey);

    const result = await db.transaction(async (tx) => {
      const [childWallet] = await tx
        .insert(agentWallets)
        .values({
          teamId: parentWallet.teamId,
          name: parsed.data.name,
          publicKey: parsed.data.publicKey,
          network: parentWallet.network,
        })
        .returning({
          id: agentWallets.id,
          publicKey: agentWallets.publicKey,
          network: agentWallets.network,
        });

      if (!childWallet) throw new Error("Child wallet insert failed");

      const [childPolicy] = await tx
        .insert(policies)
        .values({
          walletId: childWallet.id,
          dailyCap,
          perVendorCap,
          approvalThreshold,
          blocklist: [],
          allowlist: [],
          allowlistMode: false,
          notificationChannelIds: parentPolicy.notificationChannelIds,
          timezone: parentPolicy.timezone,
          version: 1,
          parentPolicyPda,
        })
        .returning({
          id: policies.id,
          parentPolicyPda: policies.parentPolicyPda,
        });

      if (!childPolicy) throw new Error("Child policy insert failed");

      return { childWallet, childPolicy };
    });

    return Response.json({
      walletId: result.childWallet.id,
      publicKey: result.childWallet.publicKey,
      network: result.childWallet.network,
      policyId: result.childPolicy.id,
      parentPolicyPda: result.childPolicy.parentPolicyPda,
    });
  } catch {
    return Errors.internal();
  }
}
