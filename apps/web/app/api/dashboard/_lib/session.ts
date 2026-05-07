import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export async function getDashboardSession() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.userId || !session.teamId || !session.walletAddress) {
    return null;
  }

  return session;
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
