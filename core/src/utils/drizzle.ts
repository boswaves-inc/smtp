import {
    sql,
    type AnyColumn,
    type SQL,
    type InferSelectModel,
    is,
    type SelectedFields,
    type GetColumnData,
    and,
    type SQLWrapper,
    Table,
    Column,
    View,
    Subquery,
    type NotNull,
    Placeholder,
    type ColumnBaseConfig,
    type ColumnDataType
} from "drizzle-orm";
import {
    type PgTable,
    type TableConfig,
    PgText,
    PgTimestampString
} from "drizzle-orm/pg-core";
import type { SelectResultFields } from "drizzle-orm/query-builders/select.types";

export type InferData<T extends SQLWrapper> = T extends Table
    ? InferSelectModel<T>
    : T extends Column
    ? T['_']['notNull'] extends true
    ? T['_']['data']
    : T['_']['data'] | null
    : T extends View | Subquery
    ? T['_']['selectedFields']
    : T extends SQL<infer U>
    ? U
    : T extends SQL.Aliased<infer U>
    ? U
    : unknown;

// export function jsonBuildObject<T extends SelectedFields<any, any>>(shape: T) {
//     const chunks: SQL[] = [];

//     Object.entries(shape).forEach(([key, value]) => {
//         if (chunks.length > 0) {
//             chunks.push(sql.raw(`,`));
//         }

//         chunks.push(sql.raw(`'${key}',`));

//         // json_build_object formats to ISO 8601 ...
//         if (is(value, PgTimestampString)) {
//             chunks.push(sql`timezone('UTC', ${value})`);
//         } else {
//             chunks.push(sql`${value}`);
//         }
//     });

//     return sql<SelectResultFields<T>>`json_build_object(${sql.join(
//         chunks
//     )})`;
// }

// export function jsonAggBuildObject<
//     T extends SelectedFields<any, any>,
//     Column extends AnyColumn,
// >(
//     shape: T,
//     options?: { orderBy?: { colName: Column; direction: "ASC" | "DESC" } },
// ) {
//     return sql<SelectResultFields<T>[]>`coalesce(
//     json_agg(${jsonBuildObject(shape)}
//     ${options?.orderBy
//             ? sql`ORDER BY ${options.orderBy.colName} ${sql.raw(
//                 options.orderBy.direction,
//             )}`
//             : undefined
//         })
//     FILTER (WHERE ${and(
//             sql.join(
//                 Object.values(shape).map((value) => sql`${sql`${value}`} IS NOT NULL`),
//                 sql` AND `,
//             ),
//         )})
//     ,'${sql`[]`}')`;
// }

// // with filter non-null + distinct
// export function jsonAggDistinct<Column extends AnyColumn>(column: Column) {
//     return coalesce<GetColumnData<Column, "raw">[]>(
//         sql`json_agg(distinct ${sql`${column}`}) filter (where ${column} is not null)`,
//         sql`'[]'`
//     );
// }

export function crypt(value: SQLWrapper | string, defaultValue: SQLWrapper | string): SQL<any> {
    return sql`crypt(${value}, ${defaultValue})`;
}

export function gen_salt<T>(algo: 'bf' | 'xdes' | 'sha256crypt' | 'sha512crypt') {
    return sql<T>`gen_salt(${algo})`;
}

export function coalesce<T>(value: SQL.Aliased<T> | SQL<T>, defaultValue: SQL) {
    return sql<T>`coalesce(${value}, ${defaultValue})`;
}

// export const array_agg = <T extends Record<string, AnyColumn | SQL>>(obj: T): SQL<{ [K in keyof T]: T[K] extends AnyColumn ? GetColumnData<T[K]> : T[K] extends SQL<infer U> ? U : never }[]> => {
//     const entries = Object.entries(obj).flatMap(([key, value]) => [
//         sql.raw(`'${key}'`),
//         value
//     ]);

//     return sql`json_agg(${sql.join(entries, sql`, `)})`
// }

export function json_agg_object<T extends Record<string, AnyColumn | SQL>>(obj: T): SQL<{ [K in keyof T]: T[K] extends AnyColumn ? GetColumnData<T[K]> : T[K] extends SQL<infer U> ? U : never }[]>;
export function json_agg_object<T extends Record<string, AnyColumn | SQL>>(obj: T, condition: SQL): SQL<{ [K in keyof T]: T[K] extends AnyColumn ? GetColumnData<T[K]> : T[K] extends SQL<infer U> ? U : never }[]>;
export function json_agg_object<T extends Record<string, AnyColumn | SQL>>(obj: T, condition?: SQL): SQL<{ [K in keyof T]: T[K] extends AnyColumn ? GetColumnData<T[K]> : T[K] extends SQL<infer U> ? U : never }[]> {
    const entries = Object.entries(obj).flatMap(([key, value]) => [
        sql.raw(`'${key}'`),
        value
    ]);

    if (condition != undefined) {
        return filter(
            sql`json_agg(json_build_object(${sql.join(entries, sql`, `)}))`,
            condition
        )
    }

    return sql`json_agg(json_build_object(${sql.join(entries, sql`, `)}))`
}

export const json_build_object = <T extends Record<string, AnyColumn | SQL>>(obj: T): SQL<{ [K in keyof T]: T[K] extends AnyColumn ? GetColumnData<T[K]> : T[K] extends SQL<infer U> ? U : never }> => {
    const entries = Object.entries(obj).flatMap(([key, value]) => [
        sql.raw(`'${key}'`),
        value
    ]);

    return sql`json_build_object(${sql.join(entries, sql`, `)})`;
}

export const to_json = <T extends Table>(table: T): SQL<T['$inferSelect']> => {
    return sql`to_json(${table})`;
}

export const to_json_nullable = <T extends Table>(table: T): SQL<T['$inferSelect'] | null> => {
    return sql`to_json(${table})`;
}

export const json_agg = <C extends AnyColumn>(column: C): SQL<GetColumnData<C>[]> => {
    return sql<GetColumnData<C>[]>`json_agg(${column})`;
}

export function filter<T>(aggr: SQL<T[]>, condition: SQL): SQL<T[]> {
    return sql`${aggr} FILTER (WHERE ${condition})`;
}

export function exists<T>(aggr: SQL<T>, condition: SQL): SQL<{ exists: boolean }> {
    return sql`select exists (select 1 from ${aggr} where ${condition}) as exists`;
}


// /**
//  * Aggregate sql values into an sql array.
//  *
//  * Input values, including nulls, concatenated into an array.
//  *
//  * Input arrays concatenated into array of one higher dimension (inputs must all have same
//  * dimensionality, and cannot be empty or null)
//  *
//  * @see https://www.postgresql.org/docs/9.5/functions-aggregate.html
//  *
//  * @todo Implement collapsing for null array with notNull option.
//  */
export function array_agg<T extends SQLWrapper>(expression: T): SQL<(InferData<T>)[] | null>;
export function array_agg<T extends SQLWrapper>(expression: T, condition: SQL): SQL<InferData<T>[] | null>;
export function array_agg<T extends SQLWrapper>(expression: T, condition?: SQL): SQL<InferData<T>[] | null> {
    if (condition != undefined) {
        return sql<InferData<T>[] | null>`array_agg(${expression}) filter (where ${condition})`;
    }

    return sql<InferData<T>[] | null>`array_agg(${expression})`;
}

export const increment = <T extends Partial<ColumnBaseConfig<ColumnDataType, string>> = {}>(column: AnyColumn<T>, value = 1) => {
  return sql<T>`${column} + ${value}`;
};

export const decrement = <T extends Partial<ColumnBaseConfig<ColumnDataType, string>> = {}>(column: AnyColumn<T>, value = 1) => {
  return sql<T>`${column} - ${value}`;
};