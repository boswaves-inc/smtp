import { createHash } from "crypto"

export const idempotency_key = <T>(body: T) => {
    return createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0, 32)
}

import { render as renderTemplate, toPlainText } from '@react-email/components';
import { ReactNode } from "react";
import { formData } from 'zod-form-data'
import z from "zod/v4";

type Renderer<T extends z.core.$ZodShape> = (data: z.output<z.ZodObject<T>>) => ReactNode

export const template = <T extends z.core.$ZodShape>(name: string, render: Renderer<T>, shape: T,) => {
    const handler = (data: unknown) => formData(z.object(shape)).parseAsync(data).then(async x => {
        const html = await renderTemplate(render(x))
        const text = toPlainText(html)

        return { html, text }
    }).catch(err => {
        throw err
    })



    return { handler, render }
}