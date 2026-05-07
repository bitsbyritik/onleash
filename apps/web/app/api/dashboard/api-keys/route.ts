import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, desc, eq } from "@repo/db";
import { apiKeys } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../_lib/session";

const CreateApiKeySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

function serializeKey(key: typeof apiKeys.$inferSelect) {
  return {
    id: key.id,
    name: key.name,
    keyPrefix: key.keyPrefix,
    lastUsedAt: key.lastUsedAt?.toISOString() ?? null,
    expiresAt: key.expiresAt?.toISOString() ?? null,
    isActive: key.isActive,
    createdAt: key.createdAt.toISOString(),
  };
}

export async function GET() {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const keys = await db.query.apiKeys.findMany({
    where: eq(apiKeys.teamId, session.teamId),
    orderBy: [desc(apiKeys.createdAt)],
  });

  return Response.json({ keys: keys.map(serializeKey) });
}

export async function POST(req: Request) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const parsed = CreateApiKeySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid API key name" },
      { status: 400 },
    );
  }

  const rawKey = `onl_sk_${randomBytes(24).toString("base64url")}`;
  const keyPrefix = rawKey.slice(0, 16);
  const keyHash = await bcrypt.hash(rawKey, 12);

  const [key] = await db
    .insert(apiKeys)
    .values({
      teamId: session.teamId,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
    })
    .returning();

  return Response.json(
    {
      key: serializeKey(key!),
      secret: rawKey,
    },
    { status: 201 },
  );
}
