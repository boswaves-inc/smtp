import postgres from "postgres";
import smtp from "./smtp";
import config from './config'
import logger from "./logger";
import kafka from "./kafka";

const log_client = logger({
    level: 'debug'
})

const kafka_client = kafka({
    config: config.kafka,
    logger: log_client
})

const smtp_client = smtp({
    config: config.smtp
})

const main = async () => {
    console.log('smtp starting...');

    // const smtp_client = new Smtp(config.smtp)
    // const pg_client = drizzle(postgres(config.postgres), { schema });


    await kafka_client.connect()
    await kafka_client.subscribe({
        topic: 'smtp-queued',
        fromBeginning: false
    })

    console.log('smtp ready...\n');

    await kafka_client.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                topic,
                ss: message.value?.toString(),
            })
        }
    })

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