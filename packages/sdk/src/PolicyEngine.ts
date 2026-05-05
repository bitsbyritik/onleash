import { fa } from "zod/v4/locales";
import type {
  PolicyConfig,
  TransferParams,
  PolicyCheckResult,
  SpendState,
} from "./types";

export class PolicyEngine {
  constructor(private policy: PolicyConfig) {}

  check(transfer: TransferParams, spend: SpendState): PolicyCheckResult {
    if (this.policy.blocklist.includes(transfer.to)) {
      return {
        allowed: false,
        needsApproval: false,
        violation: {
          rule: "blocklist",
          message: `Address ${transfer.to} is on the blocklist`,
          attemptedAmount: transfer.amount,
        },
      };
    }

    if (this.policy.allowlistMode && this.policy.allowlist.length > 0) {
      if (!this.policy.allowlist.includes(transfer.to)) {
        return {
          allowed: false,
          needsApproval: false,
          violation: {
            rule: "allowlist",
            message: `Address ${transfer.to} is not on the allowlist`,
            attemptedAmount: transfer.amount,
          },
        };
      }
    }

    const projectedDaily = spend.totalSpent + transfer.amount;
    if (projectedDaily > this.policy.dailyCap) {
      return {
        allowed: false,
        needsApproval: false,
        violation: {
          rule: "daily_cap",
          message:
            `Daily cap exceeded - spent ${spend.totalSpent}, ` +
            `attempting ${transfer.amount}, cap ${this.policy.dailyCap}`,
          attemptedAmount: transfer.amount,
          limitAmount: this.policy.dailyCap,
        },
      };
    }

    const vendorSpent = spend.perVendor[transfer.to] ?? 0n;
    const projectedVendor = vendorSpent + transfer.amount;
    if (projectedVendor > this.policy.perVendorCap) {
      return {
        allowed: false,
        needsApproval: false,
        violation: {
          rule: "vendor_cap",
          message:
            `Vendor cap exceeded for ${transfer.to} - ` +
            `vendor spent ${vendorSpent}, attempting ${transfer.amount}, ` +
            `cap ${this.policy.perVendorCap}`,
          attemptedAmount: transfer.amount,
          limitAmount: this.policy.perVendorCap,
        },
      };
    }

    if (transfer.amount >= this.policy.approvalThreshold) {
      return {
        allowed: true,
        needsApproval: true,
      };
    }

    return { allowed: true, needsApproval: false };
  }

  updatePolicy(policy: PolicyConfig): void {
    this.policy = policy;
  }

  getPolicy(): PolicyConfig {
    return { ...this.policy };
  }
}
