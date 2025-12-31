import "react-router";
import type { Postgres } from "../services/postgres";
import { Auth } from "../services/auth";

declare module "react-router" {
  interface AppLoadContext {
    auth: Auth,
    postgres: Postgres
  }
}