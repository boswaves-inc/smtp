import { Head, Html, pixelBasedPreset, Tailwind } from "@react-email/components"
import type { PropsWithChildren } from "react"
import type { Config } from "tailwindcss"

const config: Config = {
    presets: [
        pixelBasedPreset
    ],
    theme: {
        extend: {
            colors: {
                brand: "#007291",
            },
        },
    },
}

export const Email = ({ children }: PropsWithChildren) => {
    return (
        <Html lang="en">
            <Head>
                <title>My email title</title>
            </Head>
            <Tailwind config={config}>
                {children}
            </Tailwind>
        </Html>
    )
}