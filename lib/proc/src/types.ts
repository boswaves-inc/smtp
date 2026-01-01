import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { KafkaMessage as PrimitiveMessage } from "kafkajs"
import { Logger } from "~/services/logger"
import schema from '~/schema/index'
import SMTPPool from "nodemailer/lib/smtp-pool";
import nodemailer from "nodemailer";
import { Smtp } from "./services/smtp";

export interface Context {
    smtp: Smtp,
    logger: Logger,
    postgres: PostgresJsDatabase<typeof schema>
}

export interface KafkaRoute {
    beginning: boolean | undefined;
    match: (string | RegExp)[];
    handler: KafkaRouteHandler;
};

export interface KafkaMiddleware {
    handler: KafkaMiddlewareHandler;
};

export interface KafkaMessage {
    partition: number,
    message: PrimitiveMessage
}

export type KafkaRouteHandler = (message: KafkaMessage) => Promise<void> | void;
export type KafkaMiddlewareHandler = (message: KafkaMessage, next: any) => Promise<void> | void;