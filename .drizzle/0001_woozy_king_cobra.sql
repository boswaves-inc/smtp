CREATE TYPE "public"."email_status" AS ENUM('processing', 'scheduled', 'failed', 'queued', 'sent', 'dlq');--> statement-breakpoint
CREATE TABLE "emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"subject" text,
	"to_emails" "citext"[] NOT NULL,
	"cc_emails" "citext"[] DEFAULT '{}' NOT NULL,
	"bcc_emails" "citext"[] DEFAULT '{}' NOT NULL,
	"status" "email_status" DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"scheduled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"idempotency_key" text,
	CONSTRAINT "emails_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE INDEX "emails_status_idx" ON "emails" USING btree ("status");--> statement-breakpoint
CREATE INDEX "emails_scheduled_for_idx" ON "emails" USING btree ("scheduled_at");