import emails from './routes/emails'
import domains from './routes/emails'

import express from 'express'
import postgres, { Postgres } from '@boswaves/smtp-core/postgres'
import { Auth } from './auth'
import compression from 'compression'
import cors from './middleware/cors'
import health from './routes/health'
import stats from './routes/stats'

const PORT = Number.parseInt(process.env.API_PORT || "3000");

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


router.use('/stats',
    stats({
        auth: auth_client,
        postgres: pg_client
    })
)

router.use('/health',
    health()
)


router.listen(PORT, "0.0.0.0", () => {
    console.log(`[API] listening on http://localhost:${PORT}`);
})
