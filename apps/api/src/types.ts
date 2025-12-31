import { Postgres } from "@boswaves/smtp-core/postgres";
import { Auth } from "./auth";

export interface Context {
    postgres: Postgres,
    auth: Auth
}