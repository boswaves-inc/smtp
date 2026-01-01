import nodemailer, { type SentMessageInfo, type Transporter } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type SmtpOptions = SMTPTransport.Options


export default ({ config }: { config: SMTPTransport.Options }) => {
    const transport = nodemailer.createTransport({
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        ...config
    })

    return transport
}