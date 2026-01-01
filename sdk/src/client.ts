import { Kafka, Partitioners, Producer } from "kafkajs";
import { Config, QueueArgs, ScheduleArgs } from "./types";

export class Smtp {
    private _producer: Producer;

    private constructor(producer: Producer) {
        this._producer = producer
    }

    public async queue(body: QueueArgs) {
        const records = await this._producer.send({
            topic: 'smtp.email-queued',
            messages: [{
                value: JSON.stringify(body)
            }]
        })
    }

    public async schedule(body: ScheduleArgs) {
        const records = await this._producer.send({
            topic: 'smtp.email-scheduled',
            messages: [{
                value: JSON.stringify(body)
            }]
        })
    }

    public static async connect({ clientId = '@boswaves-inc/smtp-sdk', ...config }: Config) {
        const client = new Kafka({ ...config, clientId, })
        const producer = client.producer({
            createPartitioner: Partitioners.DefaultPartitioner,
        })

        await producer.connect()

        return new Smtp(producer)
    }
}