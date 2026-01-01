import postgres from "postgres";
// import { Postgres } from '@boswaves/core/postgres'
// import * as schema from '@boswaves/core/schema'
// import { drizzle } from "drizzle-orm/postgres-js";
import { Smtp } from "./smtp";

import config from './config'
import { render } from "@react-email/render";
import { Kafka } from "kafkajs";

const main = async () => {
    console.log('smtp starting...');

    // const smtp_client = new Smtp(config.smtp)
    // const pg_client = drizzle(postgres(config.postgres), { schema });

    const kafka_client = new Kafka(config.kafka)
    const kafka_consumer = kafka_client.consumer({
        groupId: 'boswaves/smtp',
    })

    await kafka_consumer.connect()
    await kafka_consumer.subscribe({
        topic: 'email_queued',
        fromBeginning: false
    })

    await kafka_consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log({
                value: message.value?.toString(),
            })
        }
    })

    console.log('smtp ready...\n');

}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the worker
main().catch((err) => {
    console.error('Failed to start worker:', err);
    process.exit(1);
});