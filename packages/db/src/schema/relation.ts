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
  auditLog,
} from "./schema";

export const teamRelations = relations(teams, ({ many }) => ({
  users: many(users),
  apiKeys: many(apiKeys),
  agentWallets: many(agentWallets),
  notificationChannels: many(notificationChannels),
  transfers: many(transfers),
  auditLog: many(auditLog),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  team: one(teams, { fields: [users.teamId], references: [teams.id] }),
  auditLog: many(auditLog),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  team: one(teams, { fields: [apiKeys.teamId], references: [teams.id] }),
}));

export const agentWalletsRelations = relations(
  agentWallets,
  ({ one, many }) => ({
    team: one(teams, {
      fields: [agentWallets.teamId],
      references: [teams.id],
    }),
    policies: many(policies),
    transfers: many(transfers),
    spendTracking: many(spendTracking),
    vendorSpend: many(vendorSpend),
    policyViolations: many(policyViolations),
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

export const transfersRelations = relations(transfers, ({ one, many }) => ({
  wallet: one(agentWallets, {
    fields: [transfers.walletId],
    references: [agentWallets.id],
  }),
  team: one(teams, { fields: [transfers.teamId], references: [teams.id] }),
  policy: one(policies, {
    fields: [transfers.policyId],
    references: [policies.id],
  }),
  violations: many(policyViolations),
  approval: one(approvals, {
    fields: [transfers.id],
    references: [approvals.transferId],
  }),
  notificationLogs: many(notificationLogs),
}));

export const policyViolationsRelations = relations(
  policyViolations,
  ({ one }) => ({
    transfer: one(transfers, {
      fields: [policyViolations.transferId],
      references: [transfers.id],
    }),
    wallet: one(agentWallets, {
      fields: [policyViolations.walletId],
      references: [agentWallets.id],
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
    transfer: one(transfers, {
      fields: [notificationLogs.transferId],
      references: [transfers.id],
    }),
    channel: one(notificationChannels, {
      fields: [notificationLogs.channelId],
      references: [notificationChannels.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  team: one(teams, { fields: [auditLog.teamId], references: [teams.id] }),
  actor: one(users, { fields: [auditLog.actorId], references: [users.id] }),
}));
