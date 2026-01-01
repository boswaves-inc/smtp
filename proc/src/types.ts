import { KafkaMessage as PrimitiveMessage } from "kafkajs"
import { Logger } from "./logger"

export interface Context {
    logger: Logger
}

export interface KafkaRoute {
    beginning: boolean | undefined;
    match: (string | RegExp)[];
    handler: KafkaRouteHandler;
};

export interface KafkaMessage {
    partition: number,
    message: PrimitiveMessage
}

export type KafkaRouteHandler = (message: KafkaMessage) => Promise<void> | void;