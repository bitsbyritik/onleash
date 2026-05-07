import { and, db, eq } from "@repo/db";
import { apiKeys } from "@repo/db/schema";
import { getDashboardSession, unauthorized } from "../../_lib/session";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const session = await getDashboardSession();
  if (!session) return unauthorized();

  const { keyId } = await params;

  const [key] = await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.teamId, session.teamId)))
    .returning({ id: apiKeys.id });

  if (!key) {
    return Response.json({ error: "API key not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
