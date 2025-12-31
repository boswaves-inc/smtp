import emails from './routes/emails'
import domains from './routes/emails'

import express, { Request, Response } from 'express'
import { count, desc, eq, gt, gte } from 'drizzle-orm'
import { EmailLog, User, Domain } from '@boswaves/smtp-core/schema'
import postgres, { Postgres } from '@boswaves/smtp-core/postgres'
import { Auth } from './auth'
import compression from 'compression'
import cors from './middleware/cors'

const PORT = Number.parseInt(process.env.API_PORT || "3000");
const AUTH_KEY = process.env.AUTH_KEY || "secret"

const pg_client = new Postgres()
const auth_client = new Auth({
    postgres: pg_client
})

const router = express()

router.use(compression());
router.disable("x-powered-by");

router.use(postgres({
    port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
    host: process.env.PG_HOST ?? 'localhost',
    username: process.env.PG_USERNAME,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD
}));

router.use('/emails',
    cors(),
    emails({ auth: auth_client, postgres: pg_client })
)

router.use('/domains',
    cors(),
    domains({ auth: auth_client, postgres: pg_client })
)

router.get('/stats', async (req, res) => {
    const key = auth_client.bearer_key(req, res)

    if (key !== AUTH_KEY) {
        return res.json({
            error: 'Invalid authorization header'
        })
    }

    const month_start = new Date()

    month_start.setDate(1)
    month_start.setHours(0, 0, 0, 0)

    try {

        const result = await pg_client.transaction(async tx => {
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

        return res.json({
            app: '@boswaves/smtp',
            timestamp: new Date().toISOString(),
            stats: {
                users: {
                    total: result.user_total,
                    last_signup: result.user_last?.created_at ?? null,
                },
                emails: {
                    total: result.log_total,
                    month: result.log_month,
                },
                domains: {
                    total: result.domain_total
                }
            }
        })
    }
    catch (err) {
        console.error('Error fetching stats:', err);

        return res.json({
            error: 'Failed to fetch stats'
        }).status(500)
    }
})

router.get('/health', (_, res) => {
    return res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        service: "boswaves/smtp",
        version: "1.0.0",
    })
})

router.listen(PORT, "0.0.0.0", () => {
    console.log(`[API] listening on http://localhost:${PORT}`);
})
