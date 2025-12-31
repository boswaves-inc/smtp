import emails from './routes/emails'
import domains from './routes/emails'

import express, { Request, Response } from 'express'
import { count, desc, eq, gt, gte } from 'drizzle-orm'

import cors from 'cors'
import { Context } from './types'
import { development } from '../utils'
import { Domain, EmailLog, User } from '../../schema/index'

const PORT = Number.parseInt(process.env.API_PORT || "3000");
const AUTH_KEY = process.env.AUTH_KEY || "secret"

export default ({ auth, postgres }: Context) => {
    const router = express()

    const policy = () => cors({
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    })

    router.use('/emails',
        policy(),
        emails({ auth, postgres })
    )

    router.use('/domains',
        policy(),
        domains({ auth, postgres })
    )

    router.get('/stats', async (req, res) => {
        // const key = auth.bearer_key(req, res)

        // if (key !== AUTH_STATS_KEY) {
        //     return res.json({
        //         error: 'Invalid authorization header'
        //     })
        // }

        const month_start = new Date()
        const result = await postgres.transaction(async tx => {
            const user_total = await tx.$count(User)
            const [user_last] = await tx.select().from(User).orderBy(desc(User.created_at)).limit(1)

            const log_total = await tx.$count(EmailLog)
            const log_month = await tx.$count(EmailLog, gte(EmailLog.created_at, month_start))

            const domain_total = await tx.$count(Domain)

            return {
                user_total,
                user_last,
                log_total,
                log_month,
                domain_total
            }
        })


        // get stats
    })

    router.get('/health', (_, res) => {
        return res.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            service: "boswaves/smtp",
            version: "1.0.0",
        })
    })

    if (development()) {

    }
    else {

    }

    router.listen(PORT, "0.0.0.0", () => {
        console.log(`[API] listening on http://localhost:${PORT}`);
    })
}