import {
    CursorBasedPaginationInterface,
    CursorQueryParamsInterface,
    CursorQueryResponseInterface,
    CursorDirectionEnum,
    SortEnum,
    HasIdInterface,
    CursorInterface,
    CursorPaginationInterface,
    CursorDataInterface, CursorPaginationResponseInterface
} from ".";
import {Base64, CaseConverter} from "../utils";

export const MinLimit: number = 10, MaxLimit: number = 1000,
    CursorOrder: string = "id",
    DefaultOrder: string = "updatedAt";

export class CursorBasedPagination implements CursorBasedPaginationInterface {
    public constructor() {
    }

    public validateParameters(params: CursorQueryParamsInterface): CursorQueryResponseInterface {
        const cursor: string | undefined = params.cursor ? params.cursor : undefined,
            direction: CursorDirectionEnum = params.direction ? params.direction : CursorDirectionEnum.Next,
            withCursor: boolean = params.withCursor ? params.withCursor : false,
            limit: number = Math.min(params.limit || MinLimit, MaxLimit),
            sort: SortEnum = params.sort ? params.sort : SortEnum.Asc,
            order: string = params.order ? params.order : DefaultOrder,
            cursorSort: SortEnum = direction === CursorDirectionEnum.Next ? SortEnum.Asc : SortEnum.Desc,
            fields: string[] | undefined = params.fields ? params.fields.slice(0, 3) : undefined,
            query = params.query?.trim() ? params.query.trim() : undefined;

        return { cursor: cursor, direction: direction, withCursor: withCursor, limit: limit, cursorOrder: CursorOrder, cursorSort: cursorSort, order: order, sort: sort, fields, query };
    }

    public getNavigationCursors<T extends HasIdInterface>(rows: T[], cursorQuery: CursorQueryResponseInterface): CursorInterface {
        let hasNextPage: boolean = false,
            hasPreviousPage: boolean = false;

        if (rows.length === 0) return { hasNextPage: hasNextPage, hasPreviousPage: hasPreviousPage };

        if (rows.length > cursorQuery.limit) {
            hasNextPage = true
            rows.pop();
        }
        if (cursorQuery.cursor) {
            hasPreviousPage = true
        }
        const startItem: T = rows[0],
            startCursor: string = Base64.encode({
                id: startItem.id,
                sortValue: startItem[cursorQuery.order as keyof T] as string | number | Date,
            }),
            endItem: T = rows[rows.length - 1],
            endCursor: string = Base64.encode({
                id: endItem.id,
                sortValue: endItem[cursorQuery.order as keyof T] as string | number | Date,
            });

        return { hasNextPage: hasNextPage, hasPreviousPage: hasPreviousPage, startCursor: startCursor, endCursor: endCursor };
    }

    public getRows<T>(rows: T[], cursorQuery: CursorQueryResponseInterface): T[] {
        if (rows.length > cursorQuery.limit) {
            rows.pop();
        }
        if (cursorQuery.direction === CursorDirectionEnum.Previous) return rows.reverse();
        return rows;
    }

    public paginate<T>(rows: T[], cursorQuery: CursorQueryResponseInterface): CursorPaginationInterface<T> {
        return {cursor: this.getNavigationCursors(rows as any, cursorQuery), data: this.getRows(rows, cursorQuery)};
    }

    public getOperators(params: CursorQueryResponseInterface): [CursorDataInterface, string, string, string] {
        const cursor: CursorDataInterface = Base64.decode<CursorDataInterface>(params.cursor!),
            sortAttribute: string = CaseConverter.camelToSnake(params.order),
            operatorCursor: string = params.direction === CursorDirectionEnum.Next ? params.withCursor ? ">=" : ">" : params.withCursor ? "<=" : "<",
            operatorSort: string = params.sort === SortEnum.Asc ? ">" : "<";
        return [cursor, sortAttribute, operatorCursor, operatorSort];
    }

    public getResponse<T>(params: { message: string, data: T[], cursor: CursorInterface }): CursorPaginationResponseInterface<T> {
        return { message: params.message, data: params.data, cursor: params.cursor }
    }

    public groupResultSet<IT extends Record<number | string, any>, OT>(results: IT[], relatedOutputKeys: string[]): OT[] {
        const entityMap = new Map<string | number, OT>();

        for (const row of results) {
            const entityKey = row.id;
            if (!entityMap.has(entityKey)) {
                const initialEntity: OT = {
                    ...row,
                    ...Object.fromEntries(relatedOutputKeys.map(key => [key, []]))
                } as OT;
                entityMap.set(entityKey, initialEntity);
            }


            for (const key of relatedOutputKeys) {
                if (row[key] && !Object.values(row[key]).every(item => item == null)) {
                    if (row[key] != null) {
                        const entityValue = entityMap.get(entityKey);
                        if (!entityValue) {
                            throw new Error(`Entity not found for key: ${entityKey}`);
                        }
                        // @ts-ignore
                        entityValue[key].push(row[key]);
                    }
                }
            }
        }

        return Array.from(entityMap.values());
    }

    public formatNullObject<T extends Record<string, any>>(obj: T | null | undefined): T | null {
        if (obj == null) return null;

        const isAllNull = (value: any): boolean => {
            if (value === null) return true;
            if (typeof value === 'object') {
                return Object.values(value).every(isAllNull);
            }
            return false;
        };

        return isAllNull(obj) ? null : obj;
    }
}
