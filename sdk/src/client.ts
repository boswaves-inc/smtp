import { Kafka, Partitioners, Producer } from "kafkajs";
import { Config } from "./types";

export class Smtp {
    private _producer: Producer;

    private constructor(producer: Producer) {
        this._producer = producer
    }

    public async queue() {
        const records = await this._producer.send({
            topic: 'smtp.email-queued',
            messages: [{
                value: 'test'
            }]
        })

        console.log(records)
    }

    public async schedule() {
        const records = await this._producer.send({
            topic: 'smtp.email-scheduled',
            messages: [{
                value: 'test'
            }]
        })

        console.log(records)
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