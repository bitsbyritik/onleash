import { NextRequest } from "next/server";
import { db, eq, and } from "@repo/db";
import {
  agentWallets,
  approvals,
  notificationChannels,
  policies,
} from "@repo/db/schema";
import { authenticate } from "../_lib/auth";
import { Errors } from "../_lib/errors";
import { ApprovalCreateBodySchema } from "../_lib/validators";

async function fireTelegramNotification(
  _channelId: string,
  _payload: {
    approvalId: string;
    amount: string;
    toAddress: string;
    token: string;
    expiresAt: string;
  },
) {
  // placeholder — wire up real Telegram bot API when notification service is ready
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (!auth) return Errors.unauthorized();

    const body = await req.json();
    const parsed = ApprovalCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      return Errors.badRequest(parsed.error.issues[0]?.message ?? "Invalid body");
    }

    const { transferId, walletId, amount, toAddress, token, expiresAt, sessionId } =
      parsed.data;

    const wallet = await db.query.agentWallets.findFirst({
      where: eq(agentWallets.id, walletId),
    });

    if (!wallet) return Errors.notFound("Wallet");
    if (wallet.teamId !== auth.teamId) return Errors.forbidden();

    const [approval] = await db
      .insert(approvals)
      .values({
        transferId,
        status: "pending",
        requestedBy: "sdk",
        expiresAt: new Date(expiresAt),
      })
      .returning({ id: approvals.id, status: approvals.status });

    const policy = await db.query.policies.findFirst({
      where: and(eq(policies.walletId, walletId), eq(policies.isActive, true)),
    });

    if (policy && policy.notificationChannelIds.length > 0) {
      const channels = await db.query.notificationChannels.findMany({
        where: and(
          eq(notificationChannels.teamId, auth.teamId),
          eq(notificationChannels.status, "active"),
        ),
      });

      const telegramChannels = channels.filter(
        (ch) =>
          ch.provider === "telegram" &&
          policy.notificationChannelIds.includes(ch.id),
      );

      await Promise.allSettled(
        telegramChannels.map((ch) =>
          fireTelegramNotification(ch.id, {
            approvalId: approval!.id,
            amount,
            toAddress,
            token,
            expiresAt,
          }),
        ),
      );
    }

    return Response.json({ id: approval!.id, status: approval!.status });
  } catch {
    return Errors.internal();
  }
}
