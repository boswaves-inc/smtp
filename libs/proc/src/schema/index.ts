import { InferEnum, InferSelectModel } from 'drizzle-orm'
import { pgTable, pgEnum, uuid, text, integer, timestamp, index, jsonb } from 'drizzle-orm/pg-core'
import { citext } from './types'

export const EmailStatus = pgEnum('email_status', [
    'processing',
    'scheduled',
    'failed',
    'queued',
    'sent',
    'dlq'
])

export const Email = pgTable('emails', {
    id: uuid('id').primaryKey().defaultRandom(),

    template: text().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),

    // Email content
    subject: text(),

    to_emails: citext().array().notNull(),
    cc_emails: citext().array().notNull().default([]),
    bcc_emails: citext().array().notNull().default([]),
    // payload: jsonb('payload').$type<Record<string, unknown>>().default({}),

    status: EmailStatus('status').notNull().default('queued'),
    attempts: integer().notNull().default(0),
    max_attempts: integer().notNull().default(3),

    // Status tracking
    scheduled_at: timestamp({ withTimezone: true }),
    created_at: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),

    // Idempotency
    idempotency_key: text().unique(),
}, (table) => [
    index('emails_status_idx').on(table.status),
    index('emails_scheduled_for_idx').on(table.scheduled_at),
])

export type EmailStatus = InferEnum<typeof EmailStatus>
export type Email = InferSelectModel<typeof Email>

export default {
    Email, EmailStatus
}