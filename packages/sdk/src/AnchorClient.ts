import IDL from "../../../programs/target/idl/onleash.json" assert { type: "json" };
import type { Onleash } from "./types/onleash";

import { AnchorProvider, Program, BN, type Idl } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  type Transaction,
  type VersionedTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey(
  "6ufLBSxNADjAAS7NT5f9Phnvjxc2We7n7q8s9uKx5GBn",
);

// ── All 33 error codes from IDL ───────────────────────────────────────────────
export const ONLEASH_ERRORS: Record<number, string> = {
  6000: "DailyCapExceeded",
  6001: "VendorCapExceeded",
  6002: "BlocklistedAddress",
  6003: "AddressNotAllowlisted",
  6004: "ParentDailyCapExceeded",
  6005: "ChildCapExceedsParent",
  6006: "VendorCapExceedsDailyCap",
  6007: "InvalidCap",
  6008: "ZeroAmount",
  6009: "Overflow",
  6010: "PolicyInactive",
  6011: "Unauthorized",
  6012: "BlocklistTooLarge",
  6013: "AllowlistTooLarge",
  6014: "TooManyVendors",
  6015: "ApprovalRequired",
  6016: "ChildPerVendorCapExceedsParent",
  6017: "BelowApprovalThreshold",
  6018: "ApprovalNotPending",
  6019: "ApprovalNotGranted",
  6020: "ApprovalExpired",
  6021: "ApprovalPolicyMismatch",
  6022: "InvalidExpiry",
  6023: "ParentBlocklistedAddress",
  6024: "ParentAddressNotAllowlisted",
  6025: "ParentVendorCapExceeded",
  6026: "MissingParentPolicy",
  6027: "UnexpectedParentPolicy",
  6028: "ParentPolicyMismatch",
  6029: "InvalidParentPDA",
  6030: "ApprovalNotExpired",
  6031: "PolicyAlreadyActive",
  6032: "PolicyStillActive",
};

export type InitializePolicyParams = {
  agentWallet: PublicKey;
  dailyCap: bigint;
  perVendorCap: bigint;
  approvalThreshold: bigint;
  blocklist: PublicKey[];
  allowlist: PublicKey[];
  allowlistMode: boolean;
};

export type InitializeChildPolicyParams = {
  agentWallet: PublicKey;
  dailyCap: bigint;
  perVendorCap: bigint;
  approvalThreshold: bigint;
};

export type UpdatePolicyParams = {
  dailyCap: bigint;
  perVendorCap: bigint;
  approvalThreshold: bigint;
  blocklist: PublicKey[];
  allowlist: PublicKey[];
  allowlistMode: boolean;
};

export class AnchorClient {
  private program: Program<Onleash>;
  private provider: AnchorProvider;
  readonly keypair: Keypair;

  constructor(connection: Connection, keypair: Keypair) {
    this.keypair = keypair;

    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async <T extends Transaction | VersionedTransaction>(
        tx: T,
      ): Promise<T> => {
        if ("version" in tx) {
          (tx as VersionedTransaction).sign([keypair]);
        } else {
          (tx as Transaction).partialSign(keypair);
        }
        return tx;
      },
      signAllTransactions: async <T extends Transaction | VersionedTransaction>(
        txs: T[],
      ): Promise<T[]> => {
        return txs.map((tx) => {
          if ("version" in tx) {
            (tx as VersionedTransaction).sign([keypair]);
          } else {
            (tx as Transaction).partialSign(keypair);
          }
          return tx;
        });
      },
    };

    this.provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
      preflightCommitment: "confirmed",
    });

    this.program = new Program(IDL as unknown as Onleash, this.provider);
  }

  // ── PDA helpers ───────────────────────────────────────────────────────────

  policyPda(agentWallet: PublicKey): PublicKey {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("policy"), agentWallet.toBuffer()],
      PROGRAM_ID,
    );
    return pda;
  }

  approvalPda(policyPubkey: PublicKey, seedTimestamp: bigint): PublicKey {
    const buf = Buffer.alloc(8);
    buf.writeBigInt64LE(BigInt(seedTimestamp));
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("approval"), policyPubkey.toBuffer(), buf],
      PROGRAM_ID,
    );
    return pda;
  }

  // ── initialize_policy ─────────────────────────────────────────────────────

  async initializePolicy(
    ownerKeypair: Keypair,
    params: InitializePolicyParams,
  ): Promise<string> {
    const policyPda = this.policyPda(params.agentWallet);

    return this.program.methods
      .initializePolicy({
        agent_wallet: params.agentWallet,
        daily_cap: new BN(params.dailyCap.toString()),
        per_vendor_cap: new BN(params.perVendorCap.toString()),
        approval_threshold: new BN(params.approvalThreshold.toString()),
        blocklist: params.blocklist,
        allowlist: params.allowlist,
        allowlist_mode: params.allowlistMode,
      })
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── initialize_child_policy ───────────────────────────────────────────────

  async initializeChildPolicy(
    ownerKeypair: Keypair,
    parentPolicyPda: PublicKey,
    params: InitializeChildPolicyParams,
  ): Promise<string> {
    const childPolicyPda = this.policyPda(params.agentWallet);

    return this.program.methods
      .initializeChildPolicy({
        agent_wallet: params.agentWallet,
        daily_cap: new BN(params.dailyCap.toString()),
        per_vendor_cap: new BN(params.perVendorCap.toString()),
        approval_threshold: new BN(params.approvalThreshold.toString()),
      })
      .accounts({
        childPolicy: childPolicyPda,
        parentPolicy: parentPolicyPda,
        owner: ownerKeypair.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── execute_transfer ──────────────────────────────────────────────────────

  async executeTransfer(
    recipient: PublicKey,
    amount: bigint,
    parentPolicyPubkey: PublicKey | null = null,
  ): Promise<string> {
    const policyPda = this.policyPda(this.keypair.publicKey);

    return this.program.methods
      .executeTransfer(new BN(amount.toString()), recipient)
      .accounts({
        policy: policyPda,
        parentPolicy: parentPolicyPubkey,
        agent: this.keypair.publicKey,
      } as any)
      .signers([this.keypair])
      .rpc();
  }

  // ── request_approval ──────────────────────────────────────────────────────

  async requestApproval(
    recipient: PublicKey,
    amount: bigint,
    expiresAt: bigint,
  ): Promise<{ txSig: string; approvalPda: PublicKey; seedTimestamp: bigint }> {
    const policyPda = this.policyPda(this.keypair.publicKey);
    const seedTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const approvalPda = this.approvalPda(policyPda, seedTimestamp);

    const txSig = await this.program.methods
      .requestApproval(
        new BN(amount.toString()),
        recipient,
        new BN(expiresAt.toString()),
        new BN(seedTimestamp.toString()),
      )
      .accounts({
        approval: approvalPda,
        policy: policyPda,
        agent: this.keypair.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([this.keypair])
      .rpc();

    return { txSig, approvalPda, seedTimestamp };
  }

  // ── approve_transfer ──────────────────────────────────────────────────────

  async approveTransfer(
    ownerKeypair: Keypair,
    approvalPda: PublicKey,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .approveTransfer()
      .accounts({
        approval: approvalPda,
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── reject_approval ──────────────────────────────────────────────────────

  async rejectApproval(
    ownerKeypair: Keypair,
    approvalPda: PublicKey,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .rejectApproval()
      .accounts({
        approval: approvalPda,
        policy: policyPda,
        agent: agentWallet,
        owner: ownerKeypair.publicKey,
      } as any)      .signers([ownerKeypair])
      .rpc();
  }

  // ── expire_approval ───────────────────────────────────────────────────────

  async expireApproval(
    approvalPda: PublicKey,
    agentWallet: PublicKey,
  ): Promise<string> {
    return this.program.methods
      .expireApproval()
      .accounts({
        approval: approvalPda,
        agent: agentWallet,
      } as any)
      .rpc();
  }

  // ── execute_approved_transfer ─────────────────────────────────────────────

  async executeApprovedTransfer(
    approvalPda: PublicKey,
    parentPolicyPubkey: PublicKey | null = null,
  ): Promise<string> {
    const policyPda = this.policyPda(this.keypair.publicKey);

    return this.program.methods
      .executeApprovedTransfer()
      .accounts({
        approval: approvalPda,
        policy: policyPda,
        parentPolicy: parentPolicyPubkey,
        agent: this.keypair.publicKey,
      } as any)
      .signers([this.keypair])
      .rpc();
  }

  // ── update_policy ─────────────────────────────────────────────────────────

  async updatePolicy(
    ownerKeypair: Keypair,
    agentWallet: PublicKey,
    params: UpdatePolicyParams,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .updatePolicy({
        daily_cap: new BN(params.dailyCap.toString()),
        per_vendor_cap: new BN(params.perVendorCap.toString()),
        approval_threshold: new BN(params.approvalThreshold.toString()),
        blocklist: params.blocklist,
        allowlist: params.allowlist,
        allowlist_mode: params.allowlistMode,
      })
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── deactivate_policy ─────────────────────────────────────────────────────

  async deactivatePolicy(
    ownerKeypair: Keypair,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .deactivatePolicy()
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── reactivate_policy ─────────────────────────────────────────────────────

  async reactivatePolicy(
    ownerKeypair: Keypair,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .reactivatePolicy()
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── close_policy ──────────────────────────────────────────────────────────

  async closePolicy(
    ownerKeypair: Keypair,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .closePolicy()
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── reset_daily_spend ─────────────────────────────────────────────────────

  async resetDailySpend(
    ownerKeypair: Keypair,
    agentWallet: PublicKey,
  ): Promise<string> {
    const policyPda = this.policyPda(agentWallet);

    return this.program.methods
      .resetDailySpend()
      .accounts({
        policy: policyPda,
        owner: ownerKeypair.publicKey,
      } as any)
      .signers([ownerKeypair])
      .rpc();
  }

  // ── fetch helpers ─────────────────────────────────────────────────────────

  async fetchPolicy(agentWallet: PublicKey) {
    const pda = this.policyPda(agentWallet);
    return this.program.account["policyAccount"].fetch(pda);
  }

  async fetchApproval(approvalPda: PublicKey) {
    return this.program.account["approvalAccount"].fetch(approvalPda);
  }

  // ── error parsing ─────────────────────────────────────────────────────────

  parseError(err: unknown): string {
    const msg = String(err);
    for (const [code, name] of Object.entries(ONLEASH_ERRORS)) {
      if (msg.includes(`0x${parseInt(code).toString(16)}`)) {
        return name;
      }
    }
    return msg;
  }

  getProgramId(): PublicKey {
    return PROGRAM_ID;
  }
}
