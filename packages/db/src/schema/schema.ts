import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  boolean,
  integer,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro", "team"]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "success",
  "blocked",
  "pending_approval",
  "rejected",
  "expired",
]);

export const tokenEnum = pgEnum("token", ["USDC", "SOL", "BONK", "JUP"]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
  "expired",
]);

export const violationRuleEnum = pgEnum("violation_rule", [
  "blocklist",
  "allowlist",
  "daily_cap",
  "vendor_cap",
  "approval_threshold",
]);

export const notificationProviderEnum = pgEnum("notification_provider", [
  "telegram",
  "slack",
  "discord",
  "webhook",
]);

export const notificationChannelStatusEnum = pgEnum("notification_channel", [
  "active",
  "disconnected",
  "error",
]);

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  plan: planEnum("plan").default("free").notNull(),
  walletLimit: integer("wallet_limit").default(1).notNull(),
  monthlyTransferLimit: integer("monthly_transfer_limit")
    .default(100)
    .notNull(),
  transferUsedThisMonth: integer("transfer_used_this_month")
    .default(0)
    .notNull(),
  polarCustomerId: text("polar_customer_id").unique(),
  polarSubscriptionId: text("polar_susbcription_id").unique(),
  polarProductId: text("polar_product_id"),
  polarCurrentPeriodEnd: timestamp("polar_current_period_end"),
  billingCycleStart: timestamp("billing_cycle_start").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, {
      onDelete: "cascade",
    })
    .notNull(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").default("member").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentWallets = pgTable("agent_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  publicKey: text("public_key").unique().notNull(),
  squadsVaultAddress: text("squads_vault_address"),
  onChainPolicyAccount: text("onchain_policy_account"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationChannels = pgTable("notification_channels", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  provider: notificationProviderEnum("provider").notNull(),
  status: notificationChannelStatusEnum("status").default("active").notNull(),
  encryptedConfig: text("encrypted_config").notNull(),
  encryptionIv: text("encryption_iv").notNull(),
  connectionCode: text("connection_code"),
  connectionCodeExpiresAt: timestamp("connection_code_expires_at"),
  lastUsedAt: timestamp("last_used_at"),
  lastError: text("last_error"),
  lastErrorAt: timestamp("last_error_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  dailyCap: numeric("daily_cap").notNull(),
  perVendorCap: numeric("pre_vendor_cap").notNull(),
  approvalThreshold: numeric("approval_threshold").notNull(),
  blocklist: text("blocklist").array().default([]).notNull(),
  allowlist: text("allowlist").array().default([]).notNull(),
  allowlistMode: boolean("allowlist_mode").default(false).notNull(),
  notificationChannelIds: uuid("notification_channel_ids")
    .array()
    .default([])
    .notNull(),

  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  policyId: uuid("policy_id").references(() => policies.id),
  policyVersion: integer("policy_version"),
  toAddress: text("to_address").notNull(),
  amount: numeric("amount").notNull(),
  token: tokenEnum("token").notNull(),
  status: transferStatusEnum("status").notNull(),
  signature: text("signature"),
  memo: text("memo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const policyViolations = pgTable("policy_violations", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id")
    .references(() => transfers.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  rule: violationRuleEnum("rule").notNull(),
  message: text("message").notNull(),
  attemptedAmount: numeric("attempted_amount").notNull(),
  limitAmount: numeric("limit_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id")
    .references(() => transfers.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  status: approvalStatusEnum("status").default("pending").notNull(),
  approvedBy: text("approved_by"),
  approvalToken: text("approval_token"),
  expiresAt: timestamp("expires_at").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const spendTracking = pgTable("spend_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(),
  totalSpent: numeric("total_spent").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vendorSpend = pgTable("vendor_spend", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  toAddress: text("to_address").notNull(),
  date: date("date").notNull(),
  totalSpent: numeric("total_spent").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notificationLogs = pgTable("notification_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  approvalId: uuid("approval_id")
    .references(() => approvals.id, { onDelete: "cascade" })
    .notNull(),
  channelId: uuid("channel_id").references(() => notificationChannels.id, {
    onDelete: "set null",
  }),
  provider: notificationProviderEnum("provider").notNull(),
  status: text("status").notNull(), // "sent" | "failed"
  error: text("error"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
