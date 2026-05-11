import { Keypair, PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import { ApiClient } from "./ApiClient";
import { AnchorClient } from "./AnchorClient";
import { PolicyEngine } from "./PolicyEngine";
import { SpendTracker } from "./SpendTracker";
import { HitlManager } from "./HitlManager";
import { WalletVerifier } from "./WalletVerifier";
import { SolanaClient } from "./SolanaClient";
import { TransferParamsSchema, OnLeashError } from "./types";
import type {
  LeashWalletConfig,
  TransferParams,
  TransferResult,
  PolicyConfig,
  ApiPolicyResponse,
} from "./types";

export class LeashWallet {
  private readonly api: ApiClient;
  private readonly anchor: AnchorClient;
  private readonly verifier: WalletVerifier;
  private readonly hitl: HitlManager;
  private readonly solana: SolanaClient;

  // lazy-initialized on first send()
  private engine: PolicyEngine | null = null;
  private tracker: SpendTracker | null = null;
  private policy: PolicyConfig | null = null;

  constructor(private readonly config: LeashWalletConfig) {
    this.api = new ApiClient({
      apiKey: config.apiKey,
      walletId: config.walletId,
      baseUrl: config.apibaseUrl,
    });

    this.anchor = new AnchorClient(config.connection, config.keypair);
    this.verifier = new WalletVerifier(config.keypair, this.api);
    this.hitl = new HitlManager(this.api, config.timeoutMs);
    this.solana = new SolanaClient(
      config.connection,
      config.keypair,
      config.network ?? "mainnet",
    );
  }

  // ─── Main send ─────────────────────────────────────────────────────────────

  async send(params: TransferParams): Promise<TransferResult> {
    const timestamp = new Date();

    // validate input with zod
    const parsed = TransferParamsSchema.safeParse(params);
    if (!parsed.success) {
      return {
        status: "blocked",
        reason: parsed.error.errors.map((e) => e.message).join(", "),
        transfer: params,
        timestamp,
      };
    }

    const transfer = parsed.data;

    try {
      // 1. ensure wallet is verified (auto on first call)
      await this.verifier.ensureVerified();

      // 2. lazy load policy + spend tracker
      await this.init();

      const policy = this.policy!;
      const engine = this.engine!;
      const tracker = this.tracker!;

      // 3. fetch current spend (cached)
      const spend = await tracker.getSpend();

      // 4. run policy checks
      const check = engine.check(transfer, spend);

      // ── BLOCKED ────────────────────────────────────────────────────────────
      if (!check.allowed) {
        const { id: transferId } = await this.api.createTransfer({
          fromAddress: this.solana.getPublicKey(),
          toAddress: transfer.to,
          amount: transfer.amount.toString(),
          token: transfer.token,
          status: "blocked",
          memo: transfer.memo,
          sessionId: transfer.sessionId,
          policyId: policy.id,
          policyVersion: policy.version,
        });

        await this.api.createViolation({
          transferId,
          walletId: this.config.walletId,
          rule: check.violation.rule,
          message: check.violation.message,
          attemptedAmount: check.violation.attemptedAmount.toString(),
          limitAmount: check.violation.limitAmount?.toString(),
          sessionId: transfer.sessionId,
        });

        return {
          status: "blocked",
          reason: check.violation.message,
          violatedRule: check.violation.rule,
          transfer,
          timestamp,
        };
      }

      // ── CREATE TRANSFER RECORD ─────────────────────────────────────────────
      const { id: transferId } = await this.api.createTransfer({
        fromAddress: this.solana.getPublicKey(),
        toAddress: transfer.to,
        amount: transfer.amount.toString(),
        token: transfer.token,
        status: check.needsApproval ? "pending_approval" : "success",
        memo: transfer.memo,
        sessionId: transfer.sessionId,
        policyId: policy.id,
        policyVersion: policy.version,
      });

      // ── HITL ───────────────────────────────────────────────────────────────
      let anchorApprovalPda: PublicKey | null = null;
      let approval: Awaited<ReturnType<typeof this.hitl.requestAndWait>> | null = null;

      if (check.needsApproval) {
        const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 3600);
        const { approvalPda } = await this.anchor.requestApproval(
          new PublicKey(transfer.to),
          transfer.amount,
          expiresAt,
        );
        anchorApprovalPda = approvalPda;

        approval = await this.hitl.requestAndWait(transfer, transferId);

        if (approval.status !== "approved") {
          await this.api.updateTransfer(transferId, { status: "rejected" });
          return {
            status: "rejected",
            reason: "Transfer rejected by approver",
            approvalId: approval.approvalId,
            transfer,
            timestamp,
          };
        }
      }

      // ── EXECUTE ONCHAIN ────────────────────────────────────────────────────
      let signature: string;
      const parentPolicyPubkey = policy.parentPolicyPda
        ? new PublicKey(policy.parentPolicyPda)
        : null;

      try {
        if (anchorApprovalPda) {
          signature = await this.anchor.executeApprovedTransfer(
            anchorApprovalPda,
            parentPolicyPubkey,
          );
        } else {
          signature = await this.anchor.executeTransfer(
            new PublicKey(transfer.to),
            transfer.amount,
            parentPolicyPubkey,
          );
        }
      } catch (err: any) {
        const rawTransaction = err.transaction
          ? Buffer.from(err.transaction.serialize()).toString("base64")
          : undefined;

        await this.api.updateTransfer(transferId, {
          status: "blocked",
          rawTransaction,
        });

        return {
          status: "blocked",
          reason: `On-chain error: ${err.message}`,
          transfer,
          timestamp,
        };
      }

      // ── SUCCESS ────────────────────────────────────────────────────────────
      await Promise.all([
        this.api.updateTransfer(transferId, { status: "success", signature }),
        this.api.recordSpend({
          toAddress: transfer.to,
          amount: transfer.amount.toString(),
          token: transfer.token,
        }),
      ]);

      // update local cache — avoids extra API call on next send()
      tracker.updateCache(transfer.to, transfer.amount);

      return { status: "success", signature, transfer, timestamp };
    } catch (err: any) {
      if (err instanceof OnLeashError) throw err;
      throw new OnLeashError(`Unexpected SDK error: ${err.message}`);
    }
  }

  // ─── Policy ────────────────────────────────────────────────────────────────

  async getPolicy(): Promise<PolicyConfig> {
    await this.init();
    return this.policy!;
  }

  async refreshPolicy(): Promise<void> {
    const raw = await this.api.getPolicy();
    this.policy = this.toPolicy(raw);
    this.engine?.updatePolicy(this.policy);
    this.tracker?.invalidate();
  }

  // ─── Child agent (multi-agent hierarchy) ───────────────────────────────────

  async createChildAgent(params: {
    name: string;
    keypair?: Keypair;
    dailyCap: bigint;
    perVendorCap?: bigint;
    approvalThreshold?: bigint;
  }): Promise<LeashWallet> {
    await this.init();
    const parentPolicy = this.policy!;
    const childKeypair = params.keypair ?? Keypair.generate();

    // validate child cap doesn't exceed parent
    if (params.dailyCap > parentPolicy.dailyCap) {
      throw new OnLeashError(
        `Child dailyCap (${params.dailyCap}) cannot exceed parent dailyCap (${parentPolicy.dailyCap})`,
      );
    }

    const perVendorCap = params.perVendorCap ?? params.dailyCap;
    if (perVendorCap > parentPolicy.perVendorCap) {
      throw new OnLeashError(
        `Child perVendorCap (${perVendorCap}) cannot exceed parent perVendorCap (${parentPolicy.perVendorCap})`,
      );
    }

    // create child wallet via API
    const child = await this.api.createChildWallet({
      name: params.name,
      parentWalletId: this.config.walletId,
      publicKey: childKeypair.publicKey.toBase58(),
      dailyCap: params.dailyCap.toString(),
      perVendorCap: perVendorCap.toString(),
      approvalThreshold: (
        params.approvalThreshold ?? parentPolicy.approvalThreshold
      ).toString(),
    });

    return new LeashWallet({
      ...this.config,
      keypair: childKeypair,
      walletId: child.walletId,
    });
  }

  // ─── Verification ──────────────────────────────────────────────────────────

  async verify(): Promise<void> {
    await this.verifier.verify();
  }

  // ─── Info ──────────────────────────────────────────────────────────────────

  get publicKey(): string {
    return this.solana.getPublicKey();
  }

  get walletId(): string {
    return this.config.walletId;
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async init(): Promise<void> {
    if (this.engine && this.tracker) return;
    const raw = await this.api.getPolicy();
    this.policy = this.toPolicy(raw);
    this.engine = new PolicyEngine(this.policy);
    this.tracker = new SpendTracker(this.api, this.policy.timezone);
  }

  private toPolicy(raw: ApiPolicyResponse): PolicyConfig {
    return {
      id: raw.id,
      walletId: raw.walletId,
      dailyCap: BigInt(raw.dailyCap),
      perVendorCap: BigInt(raw.perVendorCap),
      approvalThreshold: BigInt(raw.approvalThreshold),
      blocklist: raw.blocklist,
      allowlist: raw.allowlist,
      allowlistMode: raw.allowlistMode,
      notificationChannelIds: raw.notificationChannelIds,
      timezone: raw.timezone,
      version: raw.version,
    };
  }
}
