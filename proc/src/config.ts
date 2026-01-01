import type { SmtpOptions } from "./smtp"
import { KafkaConfig } from "kafkajs"
import { Options as PgOptions } from "postgres"

if (!process.env.SMTP_HOST) {
    throw new Error('SMTP_HOST variable not set')
}

if (!process.env.SMTP_EMAIL) {
    throw new Error('SMTP_EMAIL variable not set')
}

if (!process.env.SMTP_PASSWORD) {
    throw new Error('SMTP_PASSWORD variable not set')
}

export default {
    smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.STMP_PORT ? Number(process.env.STMP_PORT) : 5432,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    } satisfies SmtpOptions,
    postgres: {
        port: process.env.PG_HOST ? Number(process.env.PG_HOST) : 5432,
        host: process.env.PG_HOST ?? 'localhost',
        username: process.env.PG_USERNAME,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD
    } satisfies PgOptions<{}>,
    kafka: {
        clientId: 'boswaves/smtp',
        brokers: ['host.docker.internal:9092'],
        logCreator: () => ({ log, level }) => {
            const { message, timestamp, ...rest } = log;
            const prefix = {
                
            }
            
        }
    } satisfies KafkaConfig
}