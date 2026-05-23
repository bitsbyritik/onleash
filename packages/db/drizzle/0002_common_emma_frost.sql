ALTER TABLE "audit_log" RENAME COLUMN "actor_clerk_id" TO "actor_reown_id";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "wallet_address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reown_user_id" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_reown_user_id_unique" UNIQUE("reown_user_id");