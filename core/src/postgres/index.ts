
import { drizzle, type PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations, SQL, SQLWrapper, WithSubquery, Assume, ColumnsSelection, WithSubqueryWithoutSelection } from "drizzle-orm";
import type { PgSession, PgTable, PgSelectBuilder, SelectedFields, PgColumn, PgUpdateBuilder, PgInsertBuilder, PgDeleteBase, PgMaterializedView, PgRefreshMaterializedView, PgTransaction, PgTransactionConfig, QueryBuilder, WithSubqueryWithSelection } from "drizzle-orm/pg-core";
import type { PgCountBuilder } from "drizzle-orm/pg-core/query-builders/count";
import type { PgRaw } from "drizzle-orm/pg-core/query-builders/raw";
import type { PgViewBase } from "drizzle-orm/pg-core/view-base";
import type { TypedQueryBuilder } from "drizzle-orm/query-builders/query-builder";
import type { RowList, Row } from "postgres";

import schema from '../schema'
import storage from './storage'
import postgres from 'postgres';
import type { NextFunction, Request, Response } from "express";

export class Postgres {
    private get _store() {
        const store = storage.getStore()

        if (store == undefined) {
            throw new Error("postgres context not set")
        }

        return store
    }

    public get _() {
        return this._store._
    }

    public get query() {
        return this._store.query
    }

    public get $cache() {
        return this._store.$cache
    }

    public $count(source: PgTable | PgViewBase | SQL | SQLWrapper, filters?: SQL<unknown>): PgCountBuilder<PgSession<any, any, any>> {
        return this._store.$count(source, filters)
    }

    public $with<TAlias extends string>(alias: TAlias): {
        as: {
            <TSelection extends ColumnsSelection>(qb: TypedQueryBuilder<TSelection> | ((qb: QueryBuilder) => TypedQueryBuilder<TSelection>)): WithSubqueryWithSelection<TSelection, TAlias>;
            (qb: TypedQueryBuilder<undefined> | ((qb: QueryBuilder) => TypedQueryBuilder<undefined>)): WithSubqueryWithoutSelection<TAlias>;
        };
    };
    public $with<TAlias extends string, TSelection extends ColumnsSelection>(alias: TAlias, selection: TSelection): {
        as: (qb: SQL | ((qb: QueryBuilder) => SQL)) => WithSubqueryWithSelection<TSelection, TAlias>;
    };
    public $with<TAlias extends string, TSelection extends ColumnsSelection>(alias: TAlias, selection?: TSelection) {
        if (selection) {
            return this._store.$with(alias, selection)
        }

        return this._store.$with(alias)
    }

    public with(...queries: WithSubquery[]): { select: { (): PgSelectBuilder<undefined>; <TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection>; }; selectDistinct: { (): PgSelectBuilder<undefined>; <TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection>; }; selectDistinctOn: { (on: (PgColumn | SQLWrapper)[]): PgSelectBuilder<undefined>; <TSelection extends SelectedFields>(on: (PgColumn | SQLWrapper)[], fields: TSelection): PgSelectBuilder<TSelection>; }; update: <TTable extends PgTable>(table: TTable) => PgUpdateBuilder<TTable, PostgresJsQueryResultHKT>; insert: <TTable extends PgTable>(table: TTable) => PgInsertBuilder<TTable, PostgresJsQueryResultHKT, false>; delete: <TTable extends PgTable>(table: TTable) => PgDeleteBase<TTable, PostgresJsQueryResultHKT, undefined, undefined, false, never>; } {
        return this._store.with(...queries)
    }

    public select(): PgSelectBuilder<undefined, "db">;
    public select<TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection, "db">;
    public select<TSelection extends SelectedFields | undefined>(fields?: TSelection): PgSelectBuilder<undefined, "db"> | PgSelectBuilder<TSelection, "db"> {
        if (fields) {
            return this._store.select(fields)
        }

        return this._store.select()
    }

    public selectDistinct(): PgSelectBuilder<undefined, "db">;
    public selectDistinct<TSelection extends SelectedFields>(fields: TSelection): PgSelectBuilder<TSelection, "db">;
    public selectDistinct<TSelection extends SelectedFields | undefined>(fields?: TSelection): PgSelectBuilder<undefined, "db"> | PgSelectBuilder<TSelection, "db"> {
        if (fields) {
            return this._store.selectDistinct(fields)
        }

        return this._store.selectDistinct()
    }

    public selectDistinctOn(on: (PgColumn | SQLWrapper)[]): PgSelectBuilder<undefined, "db">;
    public selectDistinctOn<TSelection extends SelectedFields>(on: (PgColumn | SQLWrapper)[], fields: TSelection): PgSelectBuilder<TSelection, "db">;
    public selectDistinctOn<TSelection extends SelectedFields | undefined>(on: (PgColumn | SQLWrapper)[], fields?: TSelection): PgSelectBuilder<undefined, "db"> | PgSelectBuilder<TSelection, "db"> {
        if (fields) {
            return this._store.selectDistinctOn(on, fields)
        }

        return this._store.selectDistinctOn(on)
    }

    public update<TTable extends PgTable>(table: TTable): PgUpdateBuilder<TTable, PostgresJsQueryResultHKT> {
        return this._store.update(table)
    }

    public insert<TTable extends PgTable>(table: TTable): PgInsertBuilder<TTable, PostgresJsQueryResultHKT, false> {
        return this._store.insert(table)
    }

    public delete<TTable extends PgTable>(table: TTable): PgDeleteBase<TTable, PostgresJsQueryResultHKT, undefined, undefined, false, never> {
        return this._store.delete(table)
    }
    public refreshMaterializedView<TView extends PgMaterializedView>(view: TView): PgRefreshMaterializedView<PostgresJsQueryResultHKT> {
        return this._store.refreshMaterializedView(view)
    }

    public execute<TRow extends Record<string, unknown> = Record<string, unknown>>(query: SQLWrapper | string): PgRaw<RowList<Assume<TRow, Row>[]>> {
        return this._store.execute<TRow>(query)
    }

    public transaction<T>(transaction: (tx: PgTransaction<PostgresJsQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>) => Promise<T>, config?: PgTransactionConfig): Promise<T> {
        return this._store.transaction<T>(transaction)
    }

}

export default <T extends Record<string, postgres.PostgresType>>(options?: postgres.Options<T> | undefined) => {
    const client = postgres(options);
    const store = drizzle(client, { schema });

    return (req: Request, res: Response, next: NextFunction) => storage.run(store, () => next('route'))
}