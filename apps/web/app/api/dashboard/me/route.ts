import { cookies } from "next/headers";
import { db, eq } from "@repo/db";
import { teams } from "@repo/db/schema";
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

  const team = await db.query.teams.findFirst({
    where: eq(teams.id, session.teamId),
  });

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
    ...(isDev && {
      devMode: true,
      devPlan,
      devPlanOptions: VALID_PLANS,
    }),
  });
}
