CREATE TABLE "auth_nonces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nonce" text NOT NULL,
	"wallet_address" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_nonces_nonce_unique" UNIQUE("nonce")
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "approvals" ADD COLUMN "approval_pda" text;--> statement-breakpoint
ALTER TABLE "policies" ADD COLUMN "parent_policy_pda" text;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "default_network" "network" DEFAULT 'devnet' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "wallet_address" text NOT NULL;--> statement-breakpoint
CREATE INDEX "auth_nonce_wallet_idx" ON "auth_nonces" USING btree ("wallet_address");--> statement-breakpoint
CREATE INDEX "auth_nonce_expires_idx" ON "auth_nonces" USING btree ("expires_at");--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "clerk_id";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address");