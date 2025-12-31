import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

export default defineConfig(({ isSsrBuild }) => ({
  server: {
    allowedHosts: [
      "seaszn.ngrok.dev",
    ]
  },
  build: {
    rollupOptions: isSsrBuild ? {
      external: ['async_hooks'],
      input: "./server/index.ts"
    } : undefined,
  },
  optimizeDeps: {
    exclude: ["virtual:react-router/server-build"],
  },
  resolve: {
    alias: {
      '~/server': path.resolve(__dirname, './server'),
      '~': path.resolve(__dirname, './app'),
      'lodash': 'lodash-es',
    }
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
}));
