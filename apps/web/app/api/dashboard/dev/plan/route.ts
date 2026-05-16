import { cookies } from "next/headers";

const DEV_PLAN_COOKIE = "onleash_dev_plan";
const VALID_PLANS = ["free", "pro", "team"] as const;

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = body.plan as string | undefined;

  if (!plan || !(VALID_PLANS as readonly string[]).includes(plan)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  const jar = await cookies();
  jar.set(DEV_PLAN_COOKIE, plan, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // session cookie — clears on browser close
  });

  return Response.json({ ok: true, devPlan: plan });
}
