import z from "zod/v4";
import { req_idempotency_key } from "~/utils";
import { Context, KafkaMessage } from "~/types";
import { formData } from "zod-form-data";

export default ({ logger }: Context) => {
    const schema = formData({
        template: z.string(),
        to_emails: z.string().array(),
        cc_emails: z.string().array(),
        bcc_emails: z.string().array(),
    })

    return async ({ message }: KafkaMessage) => {
        if (message.value == undefined) {
            logger.error('missing message value')

            return
        }

        const content = message.value.toString()

        const body = await schema.parseAsync(JSON.parse(content))
        const key = req_idempotency_key(content)

        logger.warn({ key, body }, 'email-scheduled')
    }
}