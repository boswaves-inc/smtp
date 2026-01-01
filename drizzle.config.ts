import { defineConfig } from 'drizzle-kit'

if (!process.env.PG_DATABASE) {
    throw new Error("PG_DATABASE is not defined");
}

if (!process.env.PG_USERNAME) {
    throw new Error("PG_USERNAME is not defined");
}

if (!process.env.PG_PASSWORD) {
    throw new Error("PG_PASSWORD is not defined");
}

export default defineConfig({
    out: './.drizzle',
    schema: './lib/proc/src/schema/*',
    dialect: 'postgresql',
    migrations: {
        table: '_migrations',
        schema: 'public',
    },
    dbCredentials: {
        host: process.env.PG_HOST ?? 'localhost',
        port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
        user: process.env.PG_USERNAME,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
    }
})