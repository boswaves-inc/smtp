import compression from "compression";
import express from "express";
import morgan from "morgan";

const DEVELOPMENT = process.env.NODE_ENV === "development";
const PORT = Number.parseInt(process.env.PORT || "3001");

const router = express();

if (DEVELOPMENT) {
    console.log("Starting development server");

    const vite = await import("vite").then((vite) => vite.createServer({
        server: { middlewareMode: true },
    }));

    router.use(compression());
    router.disable("x-powered-by");

    router.use(vite.middlewares);
    router.use(async (req, res, next) => {
        try {
            const source = await vite.ssrLoadModule("./server/index.ts");

            return await source.default(req, res, next)
        }
        catch (error) {
            if (typeof error === "object" && error instanceof Error) {
                vite.ssrFixStacktrace(error);
            }

            next(error);
        }
    });
}
else {
    console.log("Starting production server");

    router.use(compression());
    router.disable("x-powered-by");

    router.use("/assets", express.static("build/client/assets", {
        immutable: true,
        maxAge: "1y"
    }));

    router.use(morgan("tiny"));
    router.use(express.static("build/client", { maxAge: "1h" }));

    // @ts-ignore
    router.use(await import('./build/server/index.js').then((mod) => mod.default));
}

router.listen(PORT, "0.0.0.0", () => {
    console.log(`Store is running on http://localhost:${PORT}`);
})
