CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"domain_id" uuid,
	"message_id" text,
	"from_email" varchar(255) NOT NULL,
	"to_emails" jsonb NOT NULL,
	"cc_emails" jsonb DEFAULT '[]'::jsonb,
	"bcc_emails" jsonb DEFAULT '[]'::jsonb,
	"subject" varchar(500),
	"html_content" text,
	"text_content" text,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(50) DEFAULT 'pending',
	"ses_message_id" text,
	"error_message" text,
	"webhook_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "key_name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "api_keys" ALTER COLUMN "key_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "domain" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "ses_identity_arn" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "ses_configuration_set" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "do_domain_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "domains" ALTER COLUMN "verification_token" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_domain_id_domains_id_fk" FOREIGN KEY ("domain_id") REFERENCES "public"."domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_email_logs_api_key_id" ON "email_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_domain_id" ON "email_logs" USING btree ("domain_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_message_id" ON "email_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_created_at" ON "email_logs" USING btree ("created_at");