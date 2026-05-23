import { cookies } from "next/headers";
import { db, eq, and, count } from "@repo/db";
import { agentWallets, approvals, teams, transfers } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

const DEV_PLAN_COOKIE = "onleash_dev_plan";
const VALID_PLANS = ["free", "pro", "team"] as const;
type Plan = (typeof VALID_PLANS)[number];

function isValidPlan(value: string): value is Plan {
  return (VALID_PLANS as readonly string[]).includes(value);
}

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const [team, pendingResult] = await Promise.all([
    db.query.teams.findFirst({ where: eq(teams.id, session.teamId) }),
    db
      .select({ value: count() })
      .from(approvals)
      .innerJoin(transfers, eq(approvals.transferId, transfers.id))
      .innerJoin(agentWallets, eq(transfers.walletId, agentWallets.id))
      .where(
        and(
          eq(agentWallets.teamId, session.teamId),
          eq(approvals.status, "pending"),
        ),
      ),
  ]);

  const pendingApprovals = pendingResult[0]?.value ?? 0;

  const isDev = process.env.NODE_ENV === "development";
  let devPlan: Plan | null = null;

  if (isDev) {
    const jar = await cookies();
    const cookieVal = jar.get(DEV_PLAN_COOKIE)?.value;
    const envVal = process.env.DEV_PLAN;
    const candidate = cookieVal ?? envVal;
    if (candidate && isValidPlan(candidate)) {
      devPlan = candidate;
    }
  }

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
          plan: devPlan ?? team.plan,
          walletLimit: team.walletLimit,
        }
      : null,
    pendingApprovals,
    ...(isDev && {
      devMode: true,
      devPlan,
      devPlanOptions: VALID_PLANS,
    }),
  });
}
