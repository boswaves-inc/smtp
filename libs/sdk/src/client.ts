import { CompressionTypes, Kafka, Message, Partitioners, Producer } from "kafkajs";
import { Config, QueueArgs, ScheduleArgs } from "./types";

export class Smtp {
    private _producer: Producer;


    private constructor(producer: Producer) {
        this._producer = producer
    }

    private async _send(topic: string, input: Message | Message[]) {
        const messages = Array.isArray(input) ? input : [input]

        return await this._producer.send({
            topic,
            messages,
            compression: CompressionTypes.None,
        })
    }

    public async queue(body: QueueArgs) {
        const records = await this._send('smtp.email-queued', {
            value: JSON.stringify(body)
        })
    }

    public async schedule(body: ScheduleArgs) {
        const records = await this._send('smtp.email-scheduled', {
            value: JSON.stringify(body)
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