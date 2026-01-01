import { createHash } from "crypto"

export const req_idempotency_key = <T>(body: T) => {
    return createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 32)
}