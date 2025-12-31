import _ from 'lodash';
import express from 'express'
import z from 'zod/v4'
import { Postgres } from '~/server/services/postgres';
import { Context } from '../types';

export default ({ auth }: Context) => {
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
        const { permissions } = await auth.authenticate_key(req, res)
    })

    return router;
}