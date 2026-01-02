import z from "zod/v4";
import { idempotency_key } from "~/utils";
import { Context, KafkaMessage } from "~/types";
import { Email } from '~/schema/index'
import { eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export default ({ logger, postgres, smtp }: Context) => {
    const schema = createInsertSchema(Email).omit({
        id: true,
        status: true,
        payload: true,
        attempts: true,
        created_at: true,
        updated_at: true,
        scheduled_at: true,
        max_attempts: true,
        idempotency_key: true,
    })

    return async ({ message }: KafkaMessage) => {
        if (message.value == undefined) {
            return logger.error('missing message value')
        }

        try {
            const content = JSON.parse(message.value.toString())
            const body = await schema.parseAsync(content)
            const idem_key = idempotency_key(body)

            const existing = await postgres.query.Email.findFirst({
                where: eq(Email.idempotency_key, idem_key)
            })

            if (existing) {
                return logger.info({ idempotency_key: idem_key }, 'duplicate, skipping')
            }

            // Insert and process immediately
            const [email] = await postgres.insert(Email).values({
                ...body,
                idempotency_key: idem_key,
                status: 'processing',
            }).returning()

            // get the template

            // Send the actual email
            await smtp.send_mail({
                html: "",
                to: email.to_emails,
                cc: email.cc_emails,
                bcc: email.bcc_emails,
                subject: email.subject ?? undefined,
            })

            // Mark as sent
            await postgres.update(Email).set({ status: 'sent', }).where(
                eq(Email.id, email.id)
            )

            logger.info({ email_id: email.id }, 'email sent')
        } catch (error) {
            if (error instanceof SyntaxError) {
                logger.error({ raw: message.value.toString() }, 'invalid JSON')
                return
            }

            if (error instanceof z.ZodError) {
                logger.error({ issues: error.issues }, 'validation failed')
                return
            }

            throw error
        }
    }
}