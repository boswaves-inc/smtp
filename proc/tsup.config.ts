import { defineConfig } from 'tsup'

const env = process.env.NODE_ENV;

export default defineConfig({
    clean: true,
    format: ['cjs', 'esm'], // generate cjs and esm files
    target: 'es2020',
    entry: ['src/index.ts'],
    minify: env === 'production',
    outExtension() {
        return { js: '.js' }
    },
    esbuildOptions(options) {
        options.jsx = 'automatic'
    },
})