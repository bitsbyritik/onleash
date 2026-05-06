import type { ApiClient } from "./ApiClient";
import type { TransferParams, ApprovalResult } from "./types";
import { ApprovalTimeoutError } from "./types";

const POLL_INTERVAL_MS = 3_000;
const DEFAULT_TIMEOUT_MS = 300_000;

export class HitlManager {
  constructor(
    private readonly api: ApiClient,
    private readonly timeoutMs: number = DEFAULT_TIMEOUT_MS,
  ) {}

  async requestAndWait(
    _transfer: TransferParams,
    transferId: string,
  ): Promise<ApprovalResult> {
    const expiresAt = new Date(Date.now() + this.timeoutMs);

    const approval = await this.api.createApproval({
      transferId,
      expiresAt: expiresAt.toISOString(),
    });

    return this.poll(approval.id, expiresAt);
  }

  private async poll(
    approvalId: string,
    expiresAt: Date,
  ): Promise<ApprovalResult> {
    while (true) {
      if (Date.now() >= expiresAt.getTime()) {
        throw new ApprovalTimeoutError(approvalId);
      }

      const { status } = await this.api.getApproval(approvalId);

      if (status === "approved") return { approvalId, status: "approved" };
      if (status === "rejected") return { approvalId, status: "rejected" };
      if (status === "expired") throw new ApprovalTimeoutError(approvalId);

      await sleep(POLL_INTERVAL_MS);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
