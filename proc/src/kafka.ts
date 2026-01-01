import { Kafka, KafkaConfig, logLevel as KafkaLevel } from "kafkajs"
import pino from "pino"

export default ({ logger, config }: { logger: pino.Logger, config: KafkaConfig }) => {
    const level_map = {
        [KafkaLevel.ERROR]: 'error',
        [KafkaLevel.WARN]: 'warn',
        [KafkaLevel.INFO]: 'info',
        [KafkaLevel.DEBUG]: 'debug',
        [KafkaLevel.NOTHING]: 'silent',
    } as const

    const client = new Kafka({
        ...config,
        logCreator: () => {
            const client = logger.child({ module: 'kafka' })

            return ({ level, log: { message, ...rest } }) => {
                client[level_map[level]](rest, message)
            }
        }
    })

    const consumer = client.consumer({
        groupId: 'boswaves/smtp',
    })

    return consumer
}