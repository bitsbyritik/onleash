import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { db, eq } from "@repo/db";
import { users } from "@repo/db/schema";
import { sessionOptions, type SessionData } from "@/lib/auth/session";

export async function GET() {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions,
  );

  if (!session.userId) {
    return Response.json({ user: null }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({
    user: {
      id: user.id,
      walletAddress: user.walletAddress,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  });
}
