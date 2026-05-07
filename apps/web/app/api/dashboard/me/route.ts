import { db, eq } from "@repo/db";
import { teams } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
  });

  return Response.json({
    user: {
      id: session.userId,
      walletAddress: session.walletAddress,
      role: session.role,
    },
    team: team
      ? {
          id: team.id,
          name: team.name,
          slug: team.slug,
          defaultNetwork: team.defaultNetwork,
          plan: team.plan,
          walletLimit: team.walletLimit,
        }
      : null,
  });
}
