import { InferEnum } from "drizzle-orm";
import { index, pgEnum, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

export const DomainStatus = pgEnum('domain_status', [
    'pending',
    'verified',
    'failed'
])

export const KeyPermission = pgEnum('key_permission', [
    'send',
    'recieve',
    'webhook'
])

export const User = pgTable("users", t => ({
    id: t.uuid("id").defaultRandom().primaryKey().notNull(),
    name: t.text(),
    email: t.text().unique().notNull(),
    password_hash: t.text().notNull(),
    created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}));

export const Domain = pgTable("domains", t => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    user_id: t.uuid().references(() => User.id, {
        onDelete: "cascade"
    }),
    domain: t.text().unique().notNull(),
    status: DomainStatus('status').default("pending").notNull(), // pending, verified, failed
    ses_identity_arn: t.text(),
    ses_configuration_set: t.text(),
    do_domain_id: t.text(),
    dns_records: t.jsonb().default([]),
    verification_token: t.text(),
    smtp_credentials: t.jsonb(),
    created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),

}), (table) => [
    index("idx_domains_user_id").on(table.user_id),
    index("idx_domains_domain").on(table.domain),
]);

export const ApiKey = pgTable('api_keys', t => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    user_id: t.uuid().references(() => User.id, {
        onDelete: "cascade"
    }).notNull(),
    domain_id: t.uuid().references(() => Domain.id, {
        onDelete: "cascade"
    }).notNull(),
    key_name: t.text().notNull(),
    key_hash: t.text().notNull(),
    key_prefix: t.varchar({ length: 20 }).notNull(), // First few chars for identification
    last_used_at: t.timestamp({ withTimezone: true }),
    permissions: KeyPermission('permissions').array().default(["send"]).notNull(), // ["send", "receive", "webhooks"]
    created_at: t.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updated_at: t.timestamp({ withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
}), table => [
    uniqueIndex("api_keys_user_id_key_name_unique").on(table.user_id, table.key_name),
    index("idx_api_keys_domain_id").on(table.domain_id),
    index("idx_api_keys_key_hash").on(table.key_hash),
    index("idx_api_keys_user_id").on(table.user_id),
])

export const EmailLog = pgTable('email_logs', t => ({
    id: t.uuid().defaultRandom().primaryKey().notNull(),
    api_key_id: t.uuid("api_key_id").references(() => ApiKey.id, {
        onDelete: "set null"
    }).notNull(),
    domain_id: t.uuid("domain_id").references(() => Domain.id, {
        onDelete: "cascade"
    }).notNull(),
    message_id: t.text(),
    from_email: t.varchar({ length: 255 }).notNull(),
    to_emails: t.jsonb().notNull(), // Array of email addresses
    cc_emails: t.jsonb().default([]),
    bcc_emails: t.jsonb().default([]),
    subject: t.varchar({ length: 500 }),
    html_content: t.text(),
    text_content: t.text(),
    attachments: t.jsonb().default([]),
    status: t.varchar({ length: 50 }).notNull().default("pending"), // pending, sent, failed, delivered, bounced, complained
    ses_message_id: t.text(),
    error_message: t.text(),
    webhook_data: t.jsonb(),
    created_at: t.timestamp({ withTimezone: true }).notNull().defaultNow(),
    updated_at: t.timestamp({ withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}), table => [
    index("idx_email_logs_api_key_id").on(table.api_key_id),
    index("idx_email_logs_domain_id").on(table.domain_id),
    index("idx_email_logs_message_id").on(table.message_id),
    index("idx_email_logs_created_at").on(table.created_at),
])

export type DomainStatus = InferEnum<typeof DomainStatus>
export type KeyPermission = InferEnum<typeof KeyPermission>

export type User = typeof User.$inferSelect;
export type Domain = typeof Domain.$inferSelect;
export type ApiKey = typeof ApiKey.$inferSelect;
export type EmailLog = typeof EmailLog.$inferSelect;

export default {
    User, Domain, DomainStatus, ApiKey, KeyPermission, EmailLog
}