import { KafkaConfig } from "kafkajs";

export type Config = KafkaConfig

export interface QueueArgs {
    subject?: string | undefined;
    template: string;
    
    to_emails: string[];
    cc_emails?: string[] | undefined;
    bcc_emails?: string[] | undefined;
}

export interface ScheduleArgs extends QueueArgs {
    scheduled_at: Date
}