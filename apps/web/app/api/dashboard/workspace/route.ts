import { z } from "zod";
import { and, db, eq, not } from "@repo/db";
import { agentWallets, teams } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

const WorkspaceUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug can use lowercase letters, numbers, and single hyphens",
    }),
  defaultNetwork: z.enum(["mainnet", "devnet", "testnet"]),
});

export async function PATCH(req: Request) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const parsed = WorkspaceUpdateSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid workspace details" },
      { status: 400 },
    );
  }

  const existing = await db.query.teams.findFirst({
    where: and(eq(teams.slug, parsed.data.slug), not(eq(teams.id, session.teamId))),
  });

  if (existing) {
    return Response.json(
      { error: "Workspace slug is already taken" },
      { status: 409 },
    );
  }

  const [team] = await db
    .update(teams)
    .set({
      name: parsed.data.name,
      slug: parsed.data.slug,
      defaultNetwork: parsed.data.defaultNetwork,
    })
    .where(eq(teams.id, session.teamId))
    .returning({
      id: teams.id,
      name: teams.name,
      slug: teams.slug,
      defaultNetwork: teams.defaultNetwork,
      plan: teams.plan,
      walletLimit: teams.walletLimit,
    });

  if (!team) {
    return Response.json({ error: "Workspace not found" }, { status: 404 });
  }

  await db
    .update(agentWallets)
    .set({ network: parsed.data.defaultNetwork })
    .where(eq(agentWallets.teamId, session.teamId));

  return Response.json({ team });
}
