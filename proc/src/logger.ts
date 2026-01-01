// logger.ts
import pino, { Level } from 'pino'
import pretty from "pino-pretty";

const DEVELOPMENT = process.env.NODE_ENV !== 'production'

export default ({ level = 'info' }: { level: Level }) => {
    const stream = pretty({
        colorize: true,
        ignore: "time,pid",
        translateTime: 'HH:MM:ss',

    });

    return pino({ level, }, DEVELOPMENT ? stream : undefined)
}