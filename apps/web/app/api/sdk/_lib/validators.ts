import { z } from "zod";

export const VerifyBodySchema = z.object({
  challenge: z.string().min(1),
  signature: z.string().min(1),
  publicKey: z.string().min(1),
});

export const SpendPostBodySchema = z.object({
  toAddress: z.string().min(1),
  amount: z.string().min(1),
  token: z.enum(["USDC", "SOL", "BONK", "JUP"]),
});

export const TransferCreateBodySchema = z.object({
  fromAddress: z.string().min(1),
  toAddress: z.string().min(1),
  amount: z.string().min(1),
  token: z.enum(["USDC", "SOL", "BONK", "JUP"]),
  status: z.enum([
    "success",
    "blocked",
    "pending_approval",
    "rejected",
    "expired",
  ]),
  memo: z.string().optional(),
  sessionId: z.string().optional(),
  policyId: z.string().uuid(),
  policyVersion: z.number().int(),
});

export const TransferPatchBodySchema = z.object({
  status: z
    .enum(["success", "blocked", "pending_approval", "rejected", "expired"])
    .optional(),
  signature: z.string().optional(),
  rawTransaction: z.string().optional(),
});

export const ViolationBodySchema = z.object({
  transferId: z.string().uuid(),
  walletId: z.string().uuid(),
  rule: z.enum([
    "blocklist",
    "allowlist",
    "daily_cap",
    "vendor_cap",
    "approval_threshold",
  ]),
  message: z.string().min(1),
  attemptedAmount: z.string().min(1),
  limitAmount: z.string().optional(),
  sessionId: z.string().optional(),
});

export const ApprovalCreateBodySchema = z.object({
  transferId: z.string().uuid(),
  walletId: z.string().uuid(),
  amount: z.string().min(1),
  toAddress: z.string().min(1),
  token: z.enum(["USDC", "SOL", "BONK", "JUP"]),
  expiresAt: z.string().datetime(),
  sessionId: z.string().optional(),
});
