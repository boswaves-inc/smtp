import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from 'path';

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild ? {
      external: ['async_hooks'],
      input: "./server/react/index.ts"
    } : undefined,
  },
  optimizeDeps: {
    exclude: ["virtual:react-router/server-build"],
  },
  resolve: {
    alias: {
      'lodash': 'lodash-es',
      '~/app': path.resolve(__dirname, './app'),
      '~/server': path.resolve(__dirname, './server'),
      '~/schema': path.resolve(__dirname, './schema'),
    }
  },
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
}));
