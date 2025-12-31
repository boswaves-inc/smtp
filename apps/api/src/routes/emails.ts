import _ from 'lodash';
import express from 'express'
import z from 'zod/v4'
import { Context } from '../types';
import { ApiKey, Domain, EmailLog } from '@boswaves/smtp-core/schema';
import { and, desc, eq, getTableColumns, inArray } from 'drizzle-orm';

export default ({ auth, postgres }: Context) => {
    const router = express()

    router.post('/', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

        const schema = z.object({
            from: z.email("Invalid from email"),
            to: z.array(z.email("Invalid to email")).min(1, "At least one recipient is required"),
            cc: z.array(z.email("Invalid cc email")).optional(),
            bcc: z.array(z.email("Invalid bcc email")).optional(),
            subject: z.string().min(1, "Subject is required"),
            html: z.string().optional(),
            text: z.string().optional(),
            reply_to: z.array(z.email("Invalid reply_to email")).optional(),
            tags: z.record(z.string(), z.string()).optional(),

            attachments: z.array(z.object({
                filename: z.string(),
                content: z.string(), // Base64 encoded
                contentType: z.string().optional(),
            })).optional(),
        }).refine((data) => data.html || data.text, {
            message: "Either html or text content is required",
        });


    })

    router.get('/:id', async (req, res) => {
        const { permissions } = await auth.authenticate_key(req, res)

        res.sendStatus(200)
    })

    router.get('/logs', async (req, res) => {
        const { domain_id } = await auth.authenticate_key(req, res)

        const { searchParams } = new URL(req.url);

        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const page = parseInt(searchParams.get("page") || "1");

        const status_param = searchParams.get("status");
        const domain_param = searchParams.get("domain_id");

        const offset = (page - 1) * limit;

        try {

            const { total, logs } = await postgres.transaction(async tx => {
                const total = await tx.$count(EmailLog, and(
                    inArray(EmailLog.domain_id, [domain_id]),
                    eq(EmailLog.domain_id, domain_param || EmailLog.domain_id),
                    eq(EmailLog.status, status_param || EmailLog.status)
                ))

                const logs = await tx.select({
                    ...getTableColumns(EmailLog),
                    domain_name: Domain.domain,
                    key_name: ApiKey.key_name
                }).from(EmailLog).innerJoin(Domain,
                    eq(EmailLog.domain_id, Domain.id)
                ).innerJoin(ApiKey,
                    eq(ApiKey.id, EmailLog.api_key_id)
                ).where(and(
                    inArray(EmailLog.domain_id, [domain_id]),
                    eq(EmailLog.domain_id, domain_param || EmailLog.domain_id),
                    eq(EmailLog.status, status_param || EmailLog.status)
                )).orderBy(
                    desc(EmailLog.created_at)
                ).limit(limit).offset(offset)

                return { total, logs }
            })

            return res.json({
                success: true,
                data: {
                    emails: logs,
                    pagination: {
                        page,
                        limit,
                        total,
                        total_pages: Math.ceil(total / limit),
                    },

                }
            })
        }
        catch (err) {
            console.error("API Error:", err);

            return res.json({
                error: "Internal server error"
            }).status(500)
        }
    })

    return router;
}