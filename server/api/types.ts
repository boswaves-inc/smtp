import { Auth } from "../auth";
import { Postgres } from "../postgres";

export interface Context {
    postgres: Postgres,
    auth: Auth
}