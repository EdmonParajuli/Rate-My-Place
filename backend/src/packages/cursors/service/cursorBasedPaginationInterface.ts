export enum CursorDirectionEnum {
    Next = 'next',
    Previous = 'previous',
}

export enum SortEnum {
    Desc = "DESC",
    Asc = "ASC",
}

export interface QuerySearchInterface {
    fields?: string[];
    query?: string;
}

export interface CursorDataInterface {
    id: number | string;
    sortValue: string | number | Date;
}

export interface CursorInterface {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
}

export interface CursorPaginationInterface<T> {
    cursor: CursorInterface;
    data: T[]
}

export interface CursorQueryParamsInterface extends QuerySearchInterface {
    cursor?: string;
    direction?: CursorDirectionEnum;
    withCursor?: boolean
    limit?: number;
    order?: string;
    sort?: SortEnum;
}

export interface CursorQueryResponseInterface extends QuerySearchInterface {
    cursor?: string;
    direction: CursorDirectionEnum;
    withCursor: boolean
    limit: number;
    cursorOrder: string;
    cursorSort: SortEnum
    order: string;
    sort: SortEnum;
}

export interface HasIdInterface  {
    id: number | string;
}

export interface CursorPaginationResponseInterface<T> {
    message: string;
    cursor: CursorInterface;
    data: T[]
}

export interface CursorBasedPaginationInterface {
    validateParameters(params: CursorQueryParamsInterface): CursorQueryResponseInterface;
    getNavigationCursors<T extends HasIdInterface>(rows: T[], cursorQuery: CursorQueryResponseInterface): CursorInterface;
    getRows<T>(rows: T[], cursorQuery: CursorQueryResponseInterface): T[];
    paginate<T>(rows: T[], cursorQuery: CursorQueryResponseInterface): CursorPaginationInterface<T>
    getOperators(params: CursorQueryResponseInterface): [CursorDataInterface, string, string, string];
    getResponse<T>(params: { message: string, data: T[], cursor: CursorInterface }): CursorPaginationResponseInterface<T>
    groupResultSet<IT extends Record<number | string, any>, OT>(results: IT[], relatedOutputKeys: string[]): OT[];
}