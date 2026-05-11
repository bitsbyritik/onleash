import { z } from "zod";
import { db, desc, eq } from "@repo/db";
import { agentWallets, policies, teams } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

const CreateWalletSchema = z.object({
  name: z.string().trim().min(1).max(80),
  publicKey: z.string().min(32).max(44),
  network: z.enum(["mainnet", "devnet", "testnet"]).default("devnet"),
  dailyCap: z.string().min(1),
  perVendorCap: z.string().min(1),
  approvalThreshold: z.string().min(1),
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
      { error: parsed.error.issues[0]?.message ?? "Invalid wallet details" },
      { status: 400 },
    );
  }

  const team = await db.query.teams.findFirst({ where: eq(teams.id, session.teamId) });
  if (!team) return Response.json({ error: "Team not found" }, { status: 404 });

  const existing = await db.query.agentWallets.findMany({
    where: eq(agentWallets.teamId, session.teamId),
  });
  if (existing.length >= team.walletLimit) {
    return Response.json(
      { error: `Wallet limit reached (${team.walletLimit} on ${team.plan} plan)` },
      { status: 403 },
    );
  }

  const [wallet] = await db
    .insert(agentWallets)
    .values({
      teamId: session.teamId,
      name: parsed.data.name,
      publicKey: parsed.data.publicKey,
      network: parsed.data.network,
    })
    .returning();

  await db.insert(policies).values({
    walletId: wallet!.id,
    dailyCap: BigInt(parsed.data.dailyCap),
    perVendorCap: BigInt(parsed.data.perVendorCap),
    approvalThreshold: BigInt(parsed.data.approvalThreshold),
  });

  return Response.json({ walletId: wallet!.id }, { status: 201 });
}
