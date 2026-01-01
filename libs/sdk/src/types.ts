import { KafkaConfig } from "kafkajs";

export type Config = KafkaConfig

export interface QueueArgs {
    template: string,
    to_emails: string[],
    cc_emails: string[],
    bcc_emails: string[]
}

export interface ScheduleArgs extends QueueArgs{
    scheduled_at: Date
}