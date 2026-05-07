import { NextRequest, NextResponse } from "next/server";
import { db } from "@repo/db";
import { authNonces } from "@repo/db/schema";
import { randomBytes } from "crypto";
import { databaseUnavailable, isDatabaseUnavailable } from "../_lib/db-error";

export async function POST(req: NextRequest) {
  const { walletAddress } = await req.json();
  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress required" },
      { status: 400 },
    );
  }

  const nonce = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  try {
    await db.insert(authNonces).values({
      nonce,
      walletAddress,
      expiresAt,
    });
  } catch (error) {
    if (isDatabaseUnavailable(error)) return databaseUnavailable();
    throw error;
  }

  const message =
    `Sign in to OnLeash\n` +
    `Wallet: ${walletAddress}\n` +
    `Nonce: ${nonce}\n` +
    `Expires: ${expiresAt.toISOString()}`;

  return NextResponse.json({ nonce, message });
}
