import smtp from "./smtp";
import config from './config'
import { drizzle } from 'drizzle-orm/postgres-js'
import { Logger } from "./logger";
import { Kafka } from "./kafka";
import dlq from "./routes/dlq";
import queued from "./routes/queued";
import scheduled from "./routes/scheduled";
import schema from "~/schema/index";
import postgres from "postgres";

if (!process.env.SMTP_HOST) {
    throw new Error('SMTP_HOST variable not set')
}

if (!process.env.SMTP_EMAIL) {
    throw new Error('SMTP_EMAIL variable not set')
}

if (!process.env.SMTP_PASSWORD) {
    throw new Error('SMTP_PASSWORD variable not set')
}

const log_client = new Logger({
    level: 'debug'
})

const smtp_client = smtp({
    config: {
        host: process.env.SMTP_HOST,
        port: process.env.STMP_PORT ? Number(process.env.STMP_PORT) : 5432,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    }
})

const kafka_client = new Kafka({
    config: config.kafka,
    logger: log_client
})

// Handle smtp.email-dlq messages
kafka_client.use('smtp.email-dlq', dlq({
    logger: log_client
}))

// Handle smtp.email-queued messages
kafka_client.use('smtp.email-queued', queued({
    logger: log_client
}))

// Handle smtp.email-scheduled messages
kafka_client.use('smtp.email-scheduled', scheduled({
    logger: log_client
}))

// Handle uncaught exceptions
process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    await kafka_client.disconnect()

    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    await kafka_client.disconnect()

    process.exit(1);
});


const main = async () => {
    log_client.info('starting...');

    // const smtp_client = new Smtp(config.smtp)
    const pg_client = drizzle(postgres({
        port: process.env.PG_HOST ? Number(process.env.PG_HOST) : 5432,
        host: process.env.PG_HOST ?? 'localhost',
        username: process.env.PG_USERNAME,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD
    }), { schema });

    await kafka_client.connect()
    log_client.info('connected...');

    await kafka_client.run()
    log_client.info('stopped...');
}

// Start the worker
main().catch(async (err) => {
    console.error('Failed to start worker:', err);
    await kafka_client.disconnect()

    process.exit(1);
});