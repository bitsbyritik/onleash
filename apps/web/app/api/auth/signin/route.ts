import { NextRequest, NextResponse } from "next/server";
import { db, eq, and, gt } from "@repo/db";
import { authNonces, users, teams } from "@repo/db/schema";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const { walletAddress, signature, nonce } = await req.json();

  // 1. find valid unused nonce
  const nonceRecord = await db.query.authNonces.findFirst({
    where: and(
      eq(authNonces.nonce, nonce),
      eq(authNonces.walletAddress, walletAddress),
      gt(authNonces.expiresAt, new Date()),
    ),
  });

  if (!nonceRecord || nonceRecord.usedAt) {
    return NextResponse.json(
      { error: "Invalid or expired nonce" },
      { status: 401 },
    );
  }

  // 2. verify ed25519 signature
  const message =
    `Sign in to OnLeash\n` +
    `Wallet: ${walletAddress}\n` +
    `Nonce: ${nonce}\n` +
    `Expires: ${nonceRecord.expiresAt.toISOString()}`;

  const messageBytes = new TextEncoder().encode(message);
  const signatureBytes = bs58.decode(signature);
  const publicKeyBytes = bs58.decode(walletAddress);

  const valid = nacl.sign.detached.verify(
    messageBytes,
    signatureBytes,
    publicKeyBytes,
  );

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 3. mark nonce as used
  await db
    .update(authNonces)
    .set({ usedAt: new Date() })
    .where(eq(authNonces.id, nonceRecord.id));

  // 4. find or create user + team
  let user = await db.query.users.findFirst({
    where: eq(users.walletAddress, walletAddress),
    with: { team: true },
  });

  if (!user) {
    // new user — create team + user
    const [team] = await db
      .insert(teams)
      .values({
        name: `${walletAddress.slice(0, 8)}'s team`,
        slug: walletAddress.slice(0, 8).toLowerCase(),
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
        walletAddress,
        role: "owner",
      })
      .returning();

    user = { ...newUser!, team: team! };
  }

  // 5. create session
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<{
    userId: string;
    teamId: string;
    walletAddress: string;
    role: string;
  }>(req, res, sessionOptions);

  session.userId = user.id;
  session.teamId = user.teamId;
  session.walletAddress = walletAddress;
  session.role = user.role;
  await session.save();

  return res;
}
