import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export async function POST() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  session.destroy();

  return Response.json({ ok: true });
}
