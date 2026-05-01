CREATE TYPE "public"."approval_requested_by" AS ENUM('sdk', 'api', 'system');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'activate', 'deactivate', 'revoke', 'verify', 'approve', 'reject', 'expire', 'invite');--> statement-breakpoint
CREATE TYPE "public"."audit_resource_type" AS ENUM('team', 'user', 'api_key', 'agent_wallet', 'notification_channel', 'policy', 'approval');--> statement-breakpoint
CREATE TYPE "public"."network" AS ENUM('mainnet', 'devnet', 'testnet');--> statement-breakpoint
CREATE TYPE "public"."notification_channel_status" AS ENUM('active', 'disconnected', 'error');--> statement-breakpoint
CREATE TYPE "public"."notification_log_status" AS ENUM('sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_provider" AS ENUM('telegram', 'slack', 'discord', 'webhook');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'team');--> statement-breakpoint
CREATE TYPE "public"."token" AS ENUM('USDC', 'SOL', 'BONK', 'JUP');--> statement-breakpoint
CREATE TYPE "public"."transfer_status" AS ENUM('success', 'blocked', 'pending_approval', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."violation_rule" AS ENUM('blocklist', 'allowlist', 'daily_cap', 'vendor_cap', 'approval_threshold');--> statement-breakpoint
CREATE TABLE "agent_wallets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"network" "network" DEFAULT 'mainnet' NOT NULL,
	"squads_vault_address" text,
	"onchain_policy_account" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_wallets_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" varchar(16) NOT NULL,
	"last_used_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"approved_by" text,
	"approval_token_hash" text,
	"requested_by" "approval_requested_by" DEFAULT 'sdk' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "approvals_transfer_id_unique" UNIQUE("transfer_id")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_clerk_id" text,
	"action" "audit_action" NOT NULL,
	"resource_type" "audit_resource_type" NOT NULL,
	"resource_id" uuid NOT NULL,
	"before" jsonb,
	"after" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"name" text NOT NULL,
	"provider" "notification_provider" NOT NULL,
	"status" "notification_channel_status" DEFAULT 'active' NOT NULL,
	"encrypted_config" text NOT NULL,
	"encryption_iv" text NOT NULL,
	"connection_code_hash" text,
	"connection_code_expires_at" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"last_error" text,
	"last_error_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"approval_id" uuid NOT NULL,
	"transfer_id" uuid NOT NULL,
	"channel_id" uuid,
	"provider" "notification_provider" NOT NULL,
	"status" "notification_log_status" NOT NULL,
	"error" text,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"daily_cap" bigint NOT NULL,
	"per_vendor_cap" bigint NOT NULL,
	"approval_threshold" bigint NOT NULL,
	"blocklist" text[] DEFAULT '{}' NOT NULL,
	"allowlist" text[] DEFAULT '{}' NOT NULL,
	"allowlist_mode" boolean DEFAULT false NOT NULL,
	"notification_channel_ids" uuid[] DEFAULT '{}' NOT NULL,
	"timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "policy_violations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transfer_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"rule" "violation_rule" NOT NULL,
	"message" text NOT NULL,
	"attempted_amount" bigint NOT NULL,
	"limit_amount" bigint,
	"session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spend_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"date" date NOT NULL,
	"total_spent" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(63) NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"wallet_limit" integer DEFAULT 1 NOT NULL,
	"monthly_transfer_limit" integer DEFAULT 100,
	"transfer_used_this_month" integer DEFAULT 0 NOT NULL,
	"polar_customer_id" text,
	"polar_subscription_id" text,
	"polar_product_id" text,
	"polar_current_period_end" timestamp with time zone,
	"billing_cycle_start" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_polar_customer_id_unique" UNIQUE("polar_customer_id"),
	CONSTRAINT "teams_polar_subscription_id_unique" UNIQUE("polar_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"policy_id" uuid,
	"policy_version" integer,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"amount" bigint NOT NULL,
	"token" "token" NOT NULL,
	"status" "transfer_status" NOT NULL,
	"signature" text,
	"memo" text,
	"raw_transaction" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"clerk_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_spend" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"to_address" text NOT NULL,
	"date" date NOT NULL,
	"total_spent" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text DEFAULT 'polar' NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"processed_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "webhook_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
ALTER TABLE "agent_wallets" ADD CONSTRAINT "agent_wallets_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_approval_id_approvals_id_fk" FOREIGN KEY ("approval_id") REFERENCES "public"."approvals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_channel_id_notification_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."notification_channels"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policies" ADD CONSTRAINT "policies_wallet_id_agent_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."agent_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_violations" ADD CONSTRAINT "policy_violations_transfer_id_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."transfers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_violations" ADD CONSTRAINT "policy_violations_wallet_id_agent_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."agent_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spend_tracking" ADD CONSTRAINT "spend_tracking_wallet_id_agent_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."agent_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_wallet_id_agent_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."agent_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_policy_id_policies_id_fk" FOREIGN KEY ("policy_id") REFERENCES "public"."policies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_spend" ADD CONSTRAINT "vendor_spend_wallet_id_agent_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."agent_wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_wallet_team_idx" ON "agent_wallets" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "api_key_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "api_key_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "approval_status_idx" ON "approvals" USING btree ("status");--> statement-breakpoint
CREATE INDEX "approval_expires_at_idx" ON "approvals" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "audit_log_team_created_at_idx" ON "audit_log" USING btree ("team_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_resource_idx" ON "audit_log" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "notification_channel_team_idx" ON "notification_channels" USING btree ("team_id","status");--> statement-breakpoint
CREATE INDEX "notification_channel_code_idx" ON "notification_channels" USING btree ("connection_code_hash");--> statement-breakpoint
CREATE INDEX "notification_log_approval_idx" ON "notification_logs" USING btree ("approval_id");--> statement-breakpoint
CREATE INDEX "notification_log_transfer_idx" ON "notification_logs" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "active_policy_wallet_idx" ON "policies" USING btree ("wallet_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "policy_wallet_version_idx" ON "policies" USING btree ("wallet_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "policy_violation_transfer_rule_idx" ON "policy_violations" USING btree ("transfer_id","rule");--> statement-breakpoint
CREATE INDEX "policy_violation_wallet_created_at_idx" ON "policy_violations" USING btree ("wallet_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "spend_tracking_wallet_date_idx" ON "spend_tracking" USING btree ("wallet_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "team_slug_idx" ON "teams" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "transfer_wallet_created_at_idx" ON "transfers" USING btree ("wallet_id","created_at");--> statement-breakpoint
CREATE INDEX "transfer_team_idx" ON "transfers" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "transfer_status_idx" ON "transfers" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "vendor_spend_wallet_address_date_idx" ON "vendor_spend" USING btree ("wallet_id","to_address","date");