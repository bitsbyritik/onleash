import { index, uniqueIndex } from "drizzle-orm/pg-core";
import {
  agentWallets,
  transfers,
  spendTracking,
  vendorSpend,
  apiKeys,
  policies,
  approvals,
  notificationChannels,
  notificationLogs,
} from "./schema";

export const agentWalletTeamIdx = index("agent_wallet_team_idx").on(
  agentWallets.teamId,
);

export const transferWalletIdx = index("transfer_wallet_idx").on(
  transfers.walletId,
);
export const transferTeamIdx = index("transfer_team_idx").on(transfers.teamId);
export const transferStatusIdx = index("transfer_status_idx").on(
  transfers.status,
);
export const transferCreatedAtIdx = index("transfer_created_at_idx").on(
  transfers.createdAt,
);

export const spendTrackingWalletDateIdx = uniqueIndex(
  "spend_tracking_wallet_date_idx",
).on(spendTracking.walletId, spendTracking.date);

export const vendorSpendWalletAddressDateIdx = uniqueIndex(
  "vendor_spend_wallet_address_date_idx",
).on(vendorSpend.walletId, vendorSpend.toAddress, vendorSpend.date);

export const apiKeyPrefixIdx = index("api_key_prefix_idx").on(
  apiKeys.keyPrefix,
);

export const activePolicyWalletIdx = index("active_policy_wallet_idx").on(
  policies.walletId,
  policies.isActive,
);

export const approvalStatusIdx = index("approval_status_idx").on(
  approvals.status,
);

export const notificationChannelTeamIdx = index(
  "notification_channel_team_idx",
).on(notificationChannels.teamId, notificationChannels.status);

export const notificationLogApprovalIdx = index(
  "notification_log_approval_idx",
).on(notificationLogs.approvalId);
