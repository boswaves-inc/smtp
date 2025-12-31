CREATE TYPE "public"."key_permission" AS ENUM('send', 'recieve', 'webhook');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"domain_id" uuid,
	"key_name" varchar(255) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"last_used_at" timestamp with time zone,
	"permissions" "key_permission"[] DEFAULT '{"send"}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "domain" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "ses_identity_arn" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "ses_configuration_set" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "do_domain_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "verification_token" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_user_id_key_name_unique" ON "api_keys" USING btree ("user_id","key_name");--> statement-breakpoint
CREATE INDEX "idx_api_keys_domain_id" ON "api_keys" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("user_id");