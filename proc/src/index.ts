import smtp from "./smtp";
import config from './config'
import { Logger } from "./logger";
import { Kafka } from "./kafka";
import dlq from "./routes/dlq";
import queued from "./routes/queued";
import scheduled from "./routes/scheduled";

const log_client = new Logger({
    level: 'debug'
})

const smtp_client = smtp({
    config: config.smtp
})

const kafka_client = new Kafka({
    config: config.kafka,
    logger: log_client
})

kafka_client.use('smtp.email-dlq', dlq({
    logger: log_client
}))

kafka_client.use('smtp.email-queued', queued({
    logger: log_client
}))

kafka_client.use('smtp.email-scheduled', scheduled({
    logger: log_client
}))

const main = async () => {
    log_client.info('starting...');

    // const smtp_client = new Smtp(config.smtp)
    // const pg_client = drizzle(postgres(config.postgres), { schema });

    await kafka_client.connect()
    log_client.info('connected...');
    
    await kafka_client.run()
    log_client.info('stopped...');
    

}

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

// Start the worker
main().catch(async (err) => {
    console.error('Failed to start worker:', err);
    await kafka_client.disconnect()

    process.exit(1);
});