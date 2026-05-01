import { relations } from "drizzle-orm";
import {
  teams,
  users,
  apiKeys,
  agentWallets,
  notificationChannels,
  policies,
  transfers,
  policyViolations,
  approvals,
  spendTracking,
  vendorSpend,
  notificationLogs,
} from "./schema";

export const teamRelations = relations(teams, ({ many }) => ({
  users: many(users),
  apiKeys: many(apiKeys),
  agentWallets: many(agentWallets),
  notificationChannels: many(notificationChannels),
  transfers: many(transfers),
}));

export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  team: one(teams, { fields: [apiKeys.teamId], references: [teams.id] }),
}));

export const agentWalletsRelations = relations(
  agentWallets,
  ({ one, many }) => ({
    team: one(teams, { fields: [agentWallets.teamId], references: [teams.id] }),
    policies: many(policies),
    transfers: many(transfers),
    spendTracking: many(spendTracking),
    vendorSpend: many(vendorSpend),
  }),
);

export const notificationChannelsRelations = relations(
  notificationChannels,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [notificationChannels.teamId],
      references: [teams.id],
    }),
    notificationLogs: many(notificationLogs),
  }),
);

export const policiesRelations = relations(policies, ({ one, many }) => ({
  wallet: one(agentWallets, {
    fields: [policies.walletId],
    references: [agentWallets.id],
  }),
  transfers: many(transfers),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  wallet: one(agentWallets, {
    fields: [transfers.walletId],
    references: [agentWallets.id],
  }),
  team: one(teams, { fields: [transfers.teamId], references: [teams.id] }),
  policy: one(policies, {
    fields: [transfers.policyId],
    references: [policies.id],
  }),
  violation: one(policyViolations, {
    fields: [transfers.id],
    references: [policyViolations.transferId],
  }),
  approval: one(approvals, {
    fields: [transfers.id],
    references: [approvals.transferId],
  }),
}));

export const policyViolationsRelations = relations(
  policyViolations,
  ({ one }) => ({
    transfer: one(transfers, {
      fields: [policyViolations.transferId],
      references: [transfers.id],
    }),
  }),
);

export const approvalsRelations = relations(approvals, ({ one, many }) => ({
  transfer: one(transfers, {
    fields: [approvals.transferId],
    references: [transfers.id],
  }),
  notificationLogs: many(notificationLogs),
}));

export const spendTrackingRelations = relations(spendTracking, ({ one }) => ({
  wallet: one(agentWallets, {
    fields: [spendTracking.walletId],
    references: [agentWallets.id],
  }),
}));

export const vendorSpendRelations = relations(vendorSpend, ({ one }) => ({
  wallet: one(agentWallets, {
    fields: [vendorSpend.walletId],
    references: [agentWallets.id],
  }),
}));

export const notificationLogsRelations = relations(
  notificationLogs,
  ({ one }) => ({
    approval: one(approvals, {
      fields: [notificationLogs.approvalId],
      references: [approvals.id],
    }),
    channel: one(notificationChannels, {
      fields: [notificationLogs.channelId],
      references: [notificationChannels.id],
    }),
  }),
);
