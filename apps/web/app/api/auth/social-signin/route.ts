import { NextRequest, NextResponse } from "next/server";
import { db, eq, or } from "@repo/db";
import { users, teams } from "@repo/db/schema";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth/session";
import { databaseUnavailable, isDatabaseUnavailable } from "../_lib/db-error";

// Called after Reown AppKit social/email login succeeds on the client.
// The client provides the Reown account details; we find or create a user
// and establish an iron-session.
export async function POST(req: NextRequest) {
  const body = await req.json() as {
    reownUserId?: string;
    address?: string;
    email?: string;
    name?: string;
    avatarUrl?: string;
  };

  const { reownUserId, address, email, name, avatarUrl } = body;

  if (!reownUserId && !address) {
    return NextResponse.json(
      { error: "reownUserId or address required" },
      { status: 400 },
    );
  }

  let user;
  try {
    // Look up by reownUserId first, then by walletAddress, then by email
    const conditions = [];
    if (reownUserId) conditions.push(eq(users.reownUserId, reownUserId));
    if (address) conditions.push(eq(users.walletAddress, address));

    if (conditions.length > 0) {
      user = await db.query.users.findFirst({
        where: or(...conditions),
        with: { team: true },
      });
    }

    if (!user && email) {
      user = await db.query.users.findFirst({
        where: eq(users.email, email),
        with: { team: true },
      });
    }
  } catch (error) {
    if (isDatabaseUnavailable(error)) return databaseUnavailable();
    throw error;
  }

  if (!user) {
    // New social user — create team + user
    const slugBase = (
      name?.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) ??
      reownUserId?.slice(0, 8) ??
      address?.slice(0, 8) ??
      "user"
    );
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    try {
      const [team] = await db
        .insert(teams)
        .values({
          name: name ? `${name}'s workspace` : `${slug}'s workspace`,
          slug,
          plan: "free",
          walletLimit: 1,
          monthlyTransferLimit: 100,
          transferUsedThisMonth: 0,
          billingCycleStart: new Date(),
        })
        .returning();

      const [newUser] = await db
        .insert(users)
        .values({
          teamId: team!.id,
          walletAddress: address ?? null,
          reownUserId: reownUserId ?? null,
          email: email ?? null,
          emailVerified: !!email,
          avatarUrl: avatarUrl ?? null,
          name: name ?? null,
          role: "owner",
        })
        .returning();

      user = { ...newUser!, team: team! };
    } catch (error) {
      if (isDatabaseUnavailable(error)) return databaseUnavailable();
      throw error;
    }
  } else {
    // Update profile fields that may have changed
    const updates: Partial<typeof users.$inferInsert> = {};
    if (reownUserId && !user.reownUserId) updates.reownUserId = reownUserId;
    if (address && !user.walletAddress) updates.walletAddress = address;
    if (email && !user.email) { updates.email = email; updates.emailVerified = true; }
    if (avatarUrl && !user.avatarUrl) updates.avatarUrl = avatarUrl;
    if (name && !user.name) updates.name = name;

    if (Object.keys(updates).length > 0) {
      await db.update(users).set(updates).where(eq(users.id, user.id));
    }
  }

  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<{
    userId: string;
    teamId: string;
    walletAddress: string;
    role: string;
  }>(req, res, sessionOptions);

  session.userId = user.id;
  session.teamId = user.teamId;
  session.walletAddress = user.walletAddress ?? user.reownUserId ?? "";
  session.role = user.role;
  await session.save();

  return res;
}
