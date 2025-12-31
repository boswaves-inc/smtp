import { createRequestHandler } from "@react-router/express";
import postgres, { Postgres } from "./postgres";
import express from "express";
import api from "./api";

import "react-router";
import { Auth } from "./auth";

const pg_client = new Postgres()

const auth_client = new Auth({
  postgres: pg_client
})

const app_router = express();

app_router.use(postgres({
  port: process.env.PG_PORT ? Number(process.env.PG_PORT) : 5432,
  host: process.env.PG_HOST ?? 'localhost',
  username: process.env.PG_USERNAME,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD
}));

app_router.use('/api', api({
  postgres: pg_client,
  auth: auth_client
}))

app_router.use(createRequestHandler({
  build: () => {
    return import("virtual:react-router/server-build")
  },
  getLoadContext: async (req, res) => {
    return {
      auth: auth_client,
      postgres: pg_client,
    }
  }
}));

export default app_router