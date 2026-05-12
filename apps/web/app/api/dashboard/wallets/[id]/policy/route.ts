import { z } from "zod";
import { db, eq, and } from "@repo/db";
import { agentWallets, policies } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../../../_lib/session";

const UpdatePolicySchema = z.object({
  dailyCap: z.string().min(1),
  perVendorCap: z.string().min(1),
  approvalThreshold: z.string().min(1),
  blocklist: z.array(z.string()).optional(),
  allowlist: z.array(z.string()).optional(),
  allowlistMode: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const wallet = await db.query.agentWallets.findFirst({
    where: eq(agentWallets.id, id),
  });
  if (!wallet) return Response.json({ error: "Wallet not found" }, { status: 404 });
  if (wallet.teamId !== session.teamId) return Response.json({ error: "Forbidden" }, { status: 403 });

  const parsed = UpdatePolicySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid policy" }, { status: 400 });
  }

  const current = await db.query.policies.findFirst({
    where: and(eq(policies.walletId, id), eq(policies.isActive, true)),
  });

  if (current) {
    await db
      .update(policies)
      .set({
        dailyCap: BigInt(parsed.data.dailyCap),
        perVendorCap: BigInt(parsed.data.perVendorCap),
        approvalThreshold: BigInt(parsed.data.approvalThreshold),
        blocklist: parsed.data.blocklist ?? current.blocklist,
        allowlist: parsed.data.allowlist ?? current.allowlist,
        allowlistMode: parsed.data.allowlistMode ?? current.allowlistMode,
      })
      .where(eq(policies.id, current.id));
  } else {
    await db.insert(policies).values({
      walletId: id,
      dailyCap: BigInt(parsed.data.dailyCap),
      perVendorCap: BigInt(parsed.data.perVendorCap),
      approvalThreshold: BigInt(parsed.data.approvalThreshold),
    });
  }

  return Response.json({ ok: true });
}
