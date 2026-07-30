import {QueryBuilder, QueryBuilderInterface} from "../queryBuilder";
import {Base64, CaseConverter} from "./utils";
import {CursorDataInterface, CursorDirectionEnum, CursorQueryResponseInterface, SortEnum} from "./service";



export class CursorPaginate {
    public constructor() {
    }

    public static where(queryBuilder: QueryBuilder, alias: string, params: CursorQueryResponseInterface): QueryBuilder {
        if (!params.cursor) return queryBuilder;
        const { id, sortValue } = Base64.decode<CursorDataInterface>(params.cursor),
            sortAttribute = CaseConverter.camelToSnake(params.order);
        queryBuilder.andWhereNested((nested: QueryBuilderInterface) => {
            const operatorCursor = params.direction === CursorDirectionEnum.Next ? params.withCursor ? ">=" : ">" : params.withCursor ? "<=" : "<";
            nested.andWhere(`${alias}.${sortAttribute}`, "=", sortValue);
            nested.andWhere(`${alias}.id`, operatorCursor, id);
            nested.orWhereNested((childNested: QueryBuilderInterface) => {
                const operatorSort = params.sort === SortEnum.Asc ? ">" : "<";
                childNested.orWhere(`${alias}.${sortAttribute}`, operatorSort, sortValue);
                return childNested;
            });
            return nested;
        });
        return queryBuilder;
    }

    public static search(queryBuilder: QueryBuilder, alias: string, params: CursorQueryResponseInterface): QueryBuilder {
        if (!params.query || !params.fields) return queryBuilder;
        queryBuilder.andWhereNested((nested: QueryBuilderInterface) => {
            for (const field of params.fields!) {
                nested.orWhere(`${alias}.${CaseConverter.camelToSnake(field)}`, "ILIKE", `%${params.query}%`)
            }
            return nested;
        });
        return queryBuilder;
    }

    public static orderBy(queryBuilder: QueryBuilder, alias: string, params: CursorQueryResponseInterface): QueryBuilder {
        queryBuilder.orderBy(`${alias}.${CaseConverter.camelToSnake(params.order)}`, params.sort);
        queryBuilder.orderBy(`${alias}.${CaseConverter.camelToSnake(params.cursorOrder)}`, params.cursorSort);
        return queryBuilder;
    }

    public static limit(queryBuilder: QueryBuilder, alias: string, params: CursorQueryResponseInterface): QueryBuilder {
        queryBuilder.limit(params.limit + 1);
        return queryBuilder;
    }

    public static cursorQuery(queryBuilder: QueryBuilder, alias: string, params: CursorQueryResponseInterface): QueryBuilder {
        this.where(queryBuilder, alias, params);
        this.search(queryBuilder, alias, params);
        this.orderBy(queryBuilder, alias, params);
        this.limit(queryBuilder, alias, params);
        return queryBuilder;
    }
}