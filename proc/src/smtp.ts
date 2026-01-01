import nodemailer, { type SentMessageInfo, type Transporter } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type SmtpOptions = SMTPTransport.Options

export class Smtp {
    private _transporter: Transporter<SentMessageInfo, SMTPTransport.Options>;

    constructor(options: SmtpOptions) {
        this._transporter = nodemailer.createTransport({
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            ...options
        })
    }

    public async send(mailOptions: Mail.Options & Partial<SMTPTransport.Options>) {
        await this._transporter.sendMail(mailOptions)
    }

    public async close() {
        this._transporter.close()
    }
}