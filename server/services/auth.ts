import { eq } from "drizzle-orm";
import { ApiKey } from "../../schema";
import { Postgres } from "./postgres";
import express from 'express'
import bcrypt from "bcryptjs";

export class Auth {
    private _postgres: Postgres

    constructor({ postgres }: { postgres: Postgres }) {
        this._postgres = postgres
    }

    public bearer_key(req: express.Request, res: express.Response) {
        const bearer = req.headers.authorization;

        if (!bearer || !bearer.startsWith('Bearer')) {
            throw res.json({
                error: "Missing authorization header"
            }).status(401)
        }

        return bearer.substring(7);
    }

    public async generate_key(req: express.Request, res: express.Response) {

    }

    public async authenticate_key(req: express.Request, res: express.Response) {
        const key = this.bearer_key(req, res)

        // Extract prefix for efficient lookup
        // Split only on the first two underscores to handle underscores in the secret part
        const idx_1 = key.indexOf("_");
        const idx_2 = key.indexOf("_", idx_1 + 1);

        if (idx_1 === -1 || idx_2 === -1) {
            throw res.json({
                error: 'Invalid API key'
            }).status(401)
        }

        const id_part = key.substring(idx_1 + 1, idx_2);
        const secret_part = key.substring(idx_2 + 1);
        const prefix_part = key.substring(0, idx_1);

        if (prefix_part !== "frs" || !id_part || !secret_part) {
            throw res.json({
                error: 'Invalid API key'
            }).status(401)
        }

        try {
            const result = await this._postgres.transaction(async tx => {
                const result = await tx.select().from(ApiKey).where(
                    eq(ApiKey.key_prefix, `${prefix_part}_${id_part}`)
                )

                if (result.length == 0) {
                    return null
                }

                for (const row of result) {
                    const valid = await bcrypt.compare(key, row.key_hash);

                    if (valid) {
                        tx.update(ApiKey).set({
                            last_used_at: new Date()
                        }).where(eq(ApiKey.id, row.id))

                        return row
                    }
                }

                return null;
            })

            if (!result) {
                throw res.json({
                    error: 'Invalid API key'
                }).status(401)
            }

            return result
        }
        catch (error) {
            console.error("API key verification error:", error);

            throw res.json({
                error: 'Invalid API key'
            }).status(401)
        }
    }
}
