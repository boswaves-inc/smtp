CREATE TYPE "public"."domain_status" AS ENUM('pending', 'verified', 'failed');--> statement-breakpoint
CREATE TYPE "public"."key_permission" AS ENUM('send', 'recieve', 'webhook');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	"key_name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"last_used_at" timestamp with time zone,
	"permissions" "key_permission"[] DEFAULT '{"send"}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"domain" text NOT NULL,
	"status" "domain_status" DEFAULT 'pending' NOT NULL,
	"ses_identity_arn" text,
	"ses_configuration_set" text,
	"do_domain_id" text,
	"dns_records" jsonb DEFAULT '[]'::jsonb,
	"verification_token" text,
	"smtp_credentials" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "domains_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid NOT NULL,
	"domain_id" uuid NOT NULL,
	"message_id" text,
	"from_email" varchar(255) NOT NULL,
	"to_emails" jsonb NOT NULL,
	"cc_emails" "citext"[] DEFAULT '{}',
	"bcc_emails" "citext"[] DEFAULT '{}',
	"subject" varchar(500),
	"html_content" text,
	"text_content" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"ses_message_id" text,
	"error_message" text,
	"webhook_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_user_id_key_name_unique" ON "api_keys" USING btree ("user_id","key_name");--> statement-breakpoint
CREATE INDEX "idx_api_keys_domain_id" ON "api_keys" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "idx_api_keys_key_hash" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "idx_api_keys_user_id" ON "api_keys" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_domains_user_id" ON "domains" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_domains_domain" ON "domains" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "idx_email_logs_api_key_id" ON "email_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_domain_id" ON "email_logs" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_message_id" ON "email_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_created_at" ON "email_logs" USING btree ("created_at");