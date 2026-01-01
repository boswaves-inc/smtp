import { Kafka as Primitive, KafkaConfig, logLevel as KafkaLevel, Consumer, } from "kafkajs"
import { KafkaRoute, KafkaRouteHandler } from "./types";
import { Logger } from "~/logger";

export class Kafka {
    private _consumer: Consumer;
    private _routes: KafkaRoute[] = [];

    constructor({ logger, config }: { logger: Logger, config: KafkaConfig }) {
        const level_map = {
            [KafkaLevel.ERROR]: 'error',
            [KafkaLevel.WARN]: 'warn',
            [KafkaLevel.INFO]: 'info',
            [KafkaLevel.DEBUG]: 'debug',
            [KafkaLevel.NOTHING]: 'silent',
        } as const

        const client = new Primitive({
            ...config,
            logCreator: () => {
                const client = logger.child({ module: 'kafka' })

                return ({ level, log: { message, ...rest } }) => {
                    client[level_map[level]](rest, message)
                }
            }
        })

        this._consumer = client.consumer({
            groupId: 'boswaves/smtp',
        })
    }

    public use(match: string | (string | RegExp)[], handler: KafkaRouteHandler, beginning?: boolean | undefined) {
        this._routes.push({
            match: typeof match === 'string' ? [match] : match,
            beginning,
            handler,
        });
    }

    public async run() {
        await this._consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                const route = this._routes.find(r => {
                    return r.match.some(m => typeof m === 'string' ? m === topic : m.test(topic))
                });

                if (route == undefined) {
                    return
                }
                else {
                    await route.handler({
                        partition,
                        message
                    });
                }
            }
        })


        //         eachMessage: async ({ topic, partition, message }) => {

        //     kafka_router.call(topic, message)

        //     log_client.debug({
        //         topic,
        //         partition,
        //         message: message.value?.toString(),
        //     })
        // }
    }

    public async connect() {
        await this._consumer.connect()
        await Promise.all(this._routes.map(({ match, beginning }) => this._consumer.subscribe({
            topics: match,
            fromBeginning: beginning
        })))
    }

    public async disconnect() {
        await this._consumer.disconnect()
    }
}

// // export default { logger, config }: { logger: pino.Logger, config: KafkaConfig }) => {
// //     const level_map = {
// //         [KafkaLevel.ERROR]: 'error',
// //         [KafkaLevel.WARN]: 'warn',
// //         [KafkaLevel.INFO]: 'info',
// //         [KafkaLevel.DEBUG]: 'debug',
// //         [KafkaLevel.NOTHING]: 'silent',
// //     } as const

// //     const client = new Kafka({
// //         ...config,
// //         logCreator: () => {
// //             const client = logger.child({ module: 'kafka' })

// //             return ({ level, log: { message, ...rest } }) => {
// //                 client[level_map[level]](rest, message)
// //             }
// //         }
// //     })

//     const consumer = client.consumer({
//         groupId: 'boswaves/smtp',
//     })

//     return consumer
// }