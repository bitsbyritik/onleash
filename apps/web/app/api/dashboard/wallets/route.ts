import { z } from "zod";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { cookies } from "next/headers";
import { db, desc, eq, count } from "@repo/db";
import { agentWallets, policies, teams } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

const DEV_PLAN_LIMITS: Record<string, number> = { free: 1, pro: 10, team: 50 };

async function getEffectiveWalletLimit(dbLimit: number): Promise<number> {
  if (process.env.NODE_ENV !== "development") return dbLimit;
  const jar = await cookies();
  const devPlan = jar.get("onleash_dev_plan")?.value ?? process.env.DEV_PLAN;
  return (devPlan ? DEV_PLAN_LIMITS[devPlan] : undefined) ?? dbLimit;
}

const CreateWalletSchema = z.object({
  name: z.string().trim().min(1).max(80),
  publicKey: z.string().min(32).max(44),
  signature: z.string().min(1),
  nonce: z.string().min(1),
  message: z.string().min(1),
  network: z.enum(["mainnet", "devnet", "testnet"]).default("mainnet"),
  dailyCap: z.number().int().positive(),
  approvalThreshold: z.number().int().positive(),
});

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const wallets = await db.query.agentWallets.findMany({
    where: eq(agentWallets.teamId, session.teamId),
    orderBy: [desc(agentWallets.createdAt)],
    with: { policies: { where: eq(policies.isActive, true), limit: 1 } },
  });

  return Response.json({
    wallets: wallets.map((w) => ({
      id: w.id,
      name: w.name,
      publicKey: w.publicKey,
      network: w.network,
      isActive: w.isActive,
      createdAt: w.createdAt.toISOString(),
      policy: w.policies[0]
        ? {
            dailyCap: w.policies[0].dailyCap.toString(),
            perVendorCap: w.policies[0].perVendorCap.toString(),
            approvalThreshold: w.policies[0].approvalThreshold.toString(),
          }
        : null,
    })),
  });
}

export async function POST(req: Request) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const parsed = CreateWalletSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { publicKey, signature, message, name, network, dailyCap, approvalThreshold } =
    parsed.data;

  // Verify ed25519 signature — proves caller owns this wallet
  let sigValid = false;
  try {
    sigValid = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      bs58.decode(publicKey),
    );
  } catch {
    sigValid = false;
  }
  if (!sigValid) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const team = await db.query.teams.findFirst({ where: eq(teams.id, session.teamId) });
  if (!team) return Response.json({ error: "Team not found" }, { status: 404 });

  // Enforce plan wallet limit (dev override applies when devMode is active)
  const countResult = await db
    .select({ value: count() })
    .from(agentWallets)
    .where(eq(agentWallets.teamId, session.teamId));
  const walletCount = countResult[0]?.value ?? 0;
  const walletLimit = await getEffectiveWalletLimit(team.walletLimit);

  if (walletCount >= walletLimit) {
    return Response.json(
      { error: `Wallet limit reached (${walletLimit} on ${team.plan} plan)`, upgrade: true },
      { status: 403 },
    );
  }

  // Check for duplicate public key (globally unique in schema)
  const duplicate = await db.query.agentWallets.findFirst({
    where: eq(agentWallets.publicKey, publicKey),
  });
  if (duplicate) {
    return Response.json({ error: "Wallet already registered" }, { status: 409 });
  }

  // Insert wallet + policy atomically
  const result = await db.transaction(async (tx) => {
    const [wallet] = await tx
      .insert(agentWallets)
      .values({ teamId: session.teamId, name, publicKey, network })
      .returning();

    await tx.insert(policies).values({
      walletId: wallet!.id,
      dailyCap: BigInt(dailyCap),
      perVendorCap: BigInt(Math.floor(dailyCap / 2)),
      approvalThreshold: BigInt(approvalThreshold),
    });

    return wallet!;
  });

  return Response.json({ walletId: result.id, publicKey, name }, { status: 201 });
}
