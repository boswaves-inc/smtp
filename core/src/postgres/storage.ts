import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { AsyncLocalStorage } from "async_hooks";
import type schema from "../schema";

export default new AsyncLocalStorage<PostgresJsDatabase<typeof schema>>();
