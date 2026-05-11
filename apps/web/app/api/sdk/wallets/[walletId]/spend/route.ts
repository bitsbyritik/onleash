import { NextRequest } from "next/server";
import { db, eq, and, sql } from "@repo/db";
import {
  agentWallets,
  policies,
  spendTracking,
  vendorSpend,
} from "@repo/db/schema";
import { authenticate } from "../../../_lib/auth";
import { Errors } from "../../../_lib/errors";
import { SpendPostBodySchema } from "../../../_lib/validators";

function getTodayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(),
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { walletId } = await params;

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!wallet) return Errors.notFound("Wallet");
    if (wallet.teamId !== auth.teamId) return Errors.forbidden();

    const policy = await db.query.policies.findFirst({
      where: and(eq(policies.walletId, walletId), eq(policies.isActive, true)),
    });

    const timezone = policy?.timezone ?? "UTC";
    const today = getTodayInTimezone(timezone);

    const [trackingRow, vendorRows] = await Promise.all([
      db.query.spendTracking.findFirst({
        where: and(
          eq(spendTracking.walletId, walletId),
          eq(spendTracking.date, today),
        ),
      }),
      db.query.vendorSpend.findMany({
        where: and(
          eq(vendorSpend.walletId, walletId),
          eq(vendorSpend.date, today),
        ),
      }),
    ]);

    const perVendor: Record<string, string> = {};
    for (const row of vendorRows) {
      perVendor[row.toAddress] = row.totalSpent.toString();
    }

    return Response.json({
      totalSpent: (trackingRow?.totalSpent ?? 0n).toString(),
      perVendor,
      date: today,
    });
  } catch {
    return Errors.internal();
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ walletId: string }> },
) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const { walletId } = await params;

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!wallet) return Errors.notFound("Wallet");
    if (wallet.teamId !== auth.teamId) return Errors.forbidden();

    const body = await req.json();
    const parsed = SpendPostBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const { toAddress, amount } = parsed.data;

    const policy = await db.query.policies.findFirst({
      where: and(eq(policies.walletId, walletId), eq(policies.isActive, true)),
    });

    const timezone = policy?.timezone ?? "UTC";
    const today = getTodayInTimezone(timezone);
    const amountBigInt = BigInt(amount);

    await db.transaction(async (tx) => {
      await tx
        .insert(spendTracking)
        .values({ walletId, date: today, totalSpent: amountBigInt })
        .onConflictDoUpdate({
          target: [spendTracking.walletId, spendTracking.date],
          set: {
            totalSpent: sql`${spendTracking.totalSpent} + ${amountBigInt}`,
            updatedAt: new Date(),
          },
        });

      await tx
        .insert(vendorSpend)
        .values({ walletId, toAddress, date: today, totalSpent: amountBigInt })
        .onConflictDoUpdate({
          target: [vendorSpend.walletId, vendorSpend.toAddress, vendorSpend.date],
          set: {
            totalSpent: sql`${vendorSpend.totalSpent} + ${amountBigInt}`,
            updatedAt: new Date(),
          },
        });
    });

    return Response.json({ ok: true });
  } catch {
    return Errors.internal();
  }
}
