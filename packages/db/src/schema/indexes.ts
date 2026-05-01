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
  policyViolations,
  auditLog,
  teams,
} from "./schema";

export const agentWalletTeamIdx = index("agent_wallet_team_idx").on(
  agentWallets.teamId,
);

export const transferWalletCreatedAtIdx = index(
  "transfer_wallet_created_at_idx",
).on(transfers.walletId, transfers.createdAt);

export const transferTeamIdx = index("transfer_team_idx").on(transfers.teamId);

export const transferStatusIdx = index("transfer_status_idx").on(
  transfers.status,
);

export const spendTrackingWalletDateIdx = uniqueIndex(
  "spend_tracking_wallet_date_idx",
).on(spendTracking.walletId, spendTracking.date);

export const vendorSpendWalletAddressDateIdx = uniqueIndex(
  "vendor_spend_wallet_address_date_idx",
).on(vendorSpend.walletId, vendorSpend.toAddress, vendorSpend.date);

export const apiKeyPrefixIdx = index("api_key_prefix_idx").on(apiKeys.keyPrefix);

export const apiKeyActiveIdx = index("api_key_active_idx").on(apiKeys.isActive);

export const activePolicyWalletIdx = index("active_policy_wallet_idx").on(
  policies.walletId,
  policies.isActive,
);

export const policyWalletVersionIdx = uniqueIndex(
  "policy_wallet_version_idx",
).on(policies.walletId, policies.version);

export const approvalStatusIdx = index("approval_status_idx").on(
  approvals.status,
);

export const approvalExpiresAtIdx = index("approval_expires_at_idx").on(
  approvals.expiresAt,
);

export const notificationChannelTeamIdx = index(
  "notification_channel_team_idx",
).on(notificationChannels.teamId, notificationChannels.status);

export const notificationChannelCodeIdx = index(
  "notification_channel_code_idx",
).on(notificationChannels.connectionCodeHash);

export const notificationLogApprovalIdx = index(
  "notification_log_approval_idx",
).on(notificationLogs.approvalId);

export const notificationLogTransferIdx = index(
  "notification_log_transfer_idx",
).on(notificationLogs.transferId);

export const policyViolationTransferRuleIdx = uniqueIndex(
  "policy_violation_transfer_rule_idx",
).on(policyViolations.transferId, policyViolations.rule);

export const policyViolationWalletCreatedAtIdx = index(
  "policy_violation_wallet_created_at_idx",
).on(policyViolations.walletId, policyViolations.createdAt);

export const auditLogTeamCreatedAtIdx = index("audit_log_team_created_at_idx").on(
  auditLog.teamId,
  auditLog.createdAt,
);

export const auditLogResourceIdx = index("audit_log_resource_idx").on(
  auditLog.resourceType,
  auditLog.resourceId,
);

export const teamSlugIdx = uniqueIndex("team_slug_idx").on(teams.slug);
