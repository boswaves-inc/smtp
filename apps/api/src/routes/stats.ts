import _ from 'lodash';
import express from 'express'
import { Context } from '../types';
import { Domain, EmailLog, User } from '@boswaves/smtp-core/schema';
import { desc, gte } from 'drizzle-orm';

const AUTH_KEY = process.env.AUTH_KEY || "secret"

export default ({ auth, postgres }: Context) => {
    const router = express()

    router.get('/', async (req, res) => {
        const key = auth.bearer_key(req, res)
    
        if (key !== AUTH_KEY) {
            return res.json({
                error: 'Invalid authorization header'
            })
        }
    
        const month_start = new Date()
    
        month_start.setDate(1)
        month_start.setHours(0, 0, 0, 0)
    
        try {
    
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
    
    return router;
}