import "react-router";
import type { Postgres } from "./postgres";
import { Auth } from "./auth";

declare module "react-router" {
  interface AppLoadContext {
    auth: Auth,
    postgres: Postgres
  }
}