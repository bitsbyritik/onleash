import {
  pgTable,
  uuid,
  text,
  bigint,
  timestamp,
  boolean,
  integer,
  date,
  pgEnum,
  varchar,
  jsonb,
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

export const notificationChannelStatusEnum = pgEnum(
  "notification_channel_status",
  ["active", "disconnected", "error"],
);

export const notificationLogStatusEnum = pgEnum("notification_log_status", [
  "sent",
  "failed",
]);

export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "member"]);

export const networkEnum = pgEnum("network", ["mainnet", "devnet", "testnet"]);

export const approvalRequestedByEnum = pgEnum("approval_requested_by", [
  "sdk",
  "api",
  "system",
]);

export const auditResourceTypeEnum = pgEnum("audit_resource_type", [
  "team",
  "user",
  "api_key",
  "agent_wallet",
  "notification_channel",
  "policy",
  "approval",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "activate",
  "deactivate",
  "revoke",
  "verify",
  "approve",
  "reject",
  "expire",
  "invite",
]);

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 63 }).unique().notNull(),
  plan: planEnum("plan").default("free").notNull(),
  walletLimit: integer("wallet_limit").default(1).notNull(),
  monthlyTransferLimit: integer("monthly_transfer_limit").default(100),
  transferUsedThisMonth: integer("transfer_used_this_month")
    .default(0)
    .notNull(),
  polarCustomerId: text("polar_customer_id").unique(),
  polarSubscriptionId: text("polar_subscription_id").unique(),
  polarProductId: text("polar_product_id"),
  polarCurrentPeriodEnd: timestamp("polar_current_period_end", {
    withTimezone: true,
  }),
  billingCycleStart: timestamp("billing_cycle_start", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  clerkId: text("clerk_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").default("member").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const agentWallets = pgTable("agent_wallets", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  publicKey: text("public_key").unique().notNull(),
  network: networkEnum("network").default("mainnet").notNull(),
  squadsVaultAddress: text("squads_vault_address"),
  onChainPolicyAccount: text("onchain_policy_account"),
  isActive: boolean("is_active").default(true).notNull(),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
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
  connectionCodeHash: text("connection_code_hash"),
  connectionCodeExpiresAt: timestamp("connection_code_expires_at", {
    withTimezone: true,
  }),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  lastError: text("last_error"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  dailyCap: bigint("daily_cap", { mode: "bigint" }).notNull(),
  perVendorCap: bigint("per_vendor_cap", { mode: "bigint" }).notNull(),
  approvalThreshold: bigint("approval_threshold", { mode: "bigint" }).notNull(),
  blocklist: text("blocklist").array().default([]).notNull(),
  allowlist: text("allowlist").array().default([]).notNull(),
  allowlistMode: boolean("allowlist_mode").default(false).notNull(),
  notificationChannelIds: uuid("notification_channel_ids")
    .array()
    .default([])
    .notNull(),
  timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
  version: integer("version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  policyId: uuid("policy_id").references(() => policies.id, {
    onDelete: "set null",
  }),
  policyVersion: integer("policy_version"),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  token: tokenEnum("token").notNull(),
  status: transferStatusEnum("status").notNull(),
  signature: text("signature"),
  memo: text("memo"),
  rawTransaction: text("raw_transaction"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const policyViolations = pgTable("policy_violations", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id")
    .references(() => transfers.id, { onDelete: "cascade" })
    .notNull(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  rule: violationRuleEnum("rule").notNull(),
  message: text("message").notNull(),
  attemptedAmount: bigint("attempted_amount", { mode: "bigint" }).notNull(),
  limitAmount: bigint("limit_amount", { mode: "bigint" }),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  transferId: uuid("transfer_id")
    .references(() => transfers.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  status: approvalStatusEnum("status").default("pending").notNull(),
  approvedBy: text("approved_by"),
  approvalTokenHash: text("approval_token_hash"),
  requestedBy: approvalRequestedByEnum("requested_by")
    .default("sdk")
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const spendTracking = pgTable("spend_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  date: date("date").notNull(),
  totalSpent: bigint("total_spent", { mode: "bigint" }).default(0n).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const vendorSpend = pgTable("vendor_spend", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletId: uuid("wallet_id")
    .references(() => agentWallets.id, { onDelete: "cascade" })
    .notNull(),
  toAddress: text("to_address").notNull(),
  date: date("date").notNull(),
  totalSpent: bigint("total_spent", { mode: "bigint" }).default(0n).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
});

export const notificationLogs = pgTable("notification_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  approvalId: uuid("approval_id")
    .references(() => approvals.id, { onDelete: "cascade" })
    .notNull(),
  transferId: uuid("transfer_id")
    .references(() => transfers.id, { onDelete: "cascade" })
    .notNull(),
  channelId: uuid("channel_id").references(() => notificationChannels.id, {
    onDelete: "set null",
  }),
  provider: notificationProviderEnum("provider").notNull(),
  status: notificationLogStatusEnum("status").notNull(),
  error: text("error"),
  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id")
    .references(() => teams.id, { onDelete: "cascade" })
    .notNull(),
  actorId: uuid("actor_id").references(() => users.id, {
    onDelete: "set null",
  }),
  actorClerkId: text("actor_clerk_id"),
  action: auditActionEnum("action").notNull(),
  resourceType: auditResourceTypeEnum("resource_type").notNull(),
  resourceId: uuid("resource_id").notNull(),
  before: jsonb("before"),
  after: jsonb("after"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").default("polar").notNull(),
  eventId: text("event_id").unique().notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
