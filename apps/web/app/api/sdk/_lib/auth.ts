import { NextRequest } from "next/server";
import { db, eq } from "@repo/db";
import { apiKeys } from "@repo/db/schema";
import bcrypt from "bcryptjs";

export interface AuthContext {
  teamId: string;
  apiKeyId: string;
}

export async function authenticate(
  req: NextRequest,
): Promise<AuthContext | null> {
  const rawKey = req.headers.get("x-api-key");
  if (!rawKey) return null;

  const prefix = rawKey.slice(0, 16);

  const keyRecord = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyPrefix, prefix),
  });

  if (!keyRecord || !keyRecord.isActive) return null;
  if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) return null;

  const valid = await bcrypt.compare(rawKey, keyRecord.keyHash);
  if (!valid) return null;

  await db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id));

  return { teamId: keyRecord.teamId, apiKeyId: keyRecord.id };
}
