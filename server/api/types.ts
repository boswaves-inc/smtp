import { Auth } from "../services/auth";
import { Postgres } from "../services/postgres";

export interface Context {
    postgres: Postgres,
    auth: Auth
}