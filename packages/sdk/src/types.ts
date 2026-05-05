import { z } from "zod";

export type Token = "USDC" | "SOL" | "BONK" | "JUP";

export type Network = "mainnet" | "devnet" | "testnet";

export const TransferParamsSchema = z.object({
  to: z.string().min(32).max(44),
  amount: z.bigint().positive(),
  token: z.enum(["USDC", "SOL", "BONK", "JUP"]),
  memo: z.string().max(200).optional(),
  sessionId: z.string().optional(),
});

export type TransferParams = z.infer<typeof TransferParamsSchema>;

export type TransferStatus =
  | "success"
  | "blocked"
  | "pending_approval"
  | "rejected"
  | "expired";

export interface TransferResult {
  status: TransferStatus;
  signature?: string;
  reason?: string;
  approvalId?: string;
  violatedRule?: string;
  transfer: TransferParams;
  timestamp: Date;
}

export interface PolicyConfig {
  id: string;
  walletId: string;
  dailyCap: bigint;
  perVendorCap: bigint;
  approvalThreshold: bigint;
  blocklist: string[];
  allowlist: string[];
  allowlistMode: boolean;
  notificationChannelIds: string[];
  timezone: string;
  version: number;
}

export type ViolationRule =
  | "blocklist"
  | "allowlist"
  | "daily_cap"
  | "vendor_cap"
  | "approval_threshold";

export interface PolicyViolation {
  rule: ViolationRule;
  message: string;
  attemptedAmount: bigint;
  limitAmount?: bigint;
}

export type PolicyCheckResult =
  | { allowed: true; needsApproval: false }
  | { allowed: true; needsApproval: true }
  | { allowed: false; needsApproval: false; violation: PolicyViolation };

export interface SpendState {
  date: string;
  totalSpent: bigint;
  perVendor: Record<string, bigint>;
}

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired";

export interface ApprovalResult {
  approvalId: string;
  status: ApprovalStatus;
}

export interface LeashWalletConfig {
  keypair: import("@solana/web3.js").Keypair;
  connection: import("@solana/web3.js").Connection;
  apiKey: string;
  walletId: string;
  network?: Network;
  apibaseUrl?: string;
  timeoutMs?: number;
}

export interface ApiSpendResponse {
  totalSpent: string;
  perVendor: Record<string, string>;
  date: string;
}

export interface ApiPolicyResponse {
  id: string;
  walletId: string;
  dailyCap: string;
  perVendorCap: string;
  approvalThreshold: string;
  blocklist: string[];
  allowlist: string[];
  allowlistMode: boolean;
  notificationChannelIds: string[];
  timezone: string;
  version: number;
}

export interface ApiTransferResponse {
  id: string;
  status: TransferStatus;
}

export interface ApiApprovalResponse {
  id: string;
  status: ApprovalStatus;
}

export interface ApiChallengeResponse {
  challenge: string;
  expiresAt: string;
}

export interface ApiWalletResponse {
  id: string;
  publicKey: string;
  isVerified: boolean;
  network: Network;
}

export class OnLeashError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OnLeashError";
  }
}

export class PolicyViolationError extends OnLeashError {
  constructor(public readonly violation: PolicyViolation) {
    super(violation.message);
    this.name = "PolicyViolationError";
  }
}

export class ApprovalTimeoutError extends OnLeashError {
  constructor(public readonly approvalId: string) {
    super("Approval timed out — transfer rejected");
    this.name = "ApprovalTimeoutError";
  }
}

export class WalletNotVerifiedError extends OnLeashError {
  constructor() {
    super(
      "Wallet not verified — call leash.verify() first or check your walletId",
    );
    this.name = "WalletNotVerifiedError";
  }
}

export class ApiError extends OnLeashError {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
