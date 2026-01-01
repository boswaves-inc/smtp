import { Kafka, Producer } from "kafkajs";
import { Config } from "./types";

export class SmtpClient {
    private _producer: Producer;

    private constructor(producer: Producer) {
        this._producer = producer
    }

    public async send() {
        const records = await this._producer.send({
            topic: 'smtp-queued',
            messages: [{
                value: 'test'
            }]
        })

        console.log(records)
    }

    public static async connect({ clientId = '@boswaves-inc/smtp-sdk', ...config }: Config) {
        const client = new Kafka({ ...config, clientId, })
        const producer = client.producer()

        await producer.connect()

        return new SmtpClient(producer)
    }
}