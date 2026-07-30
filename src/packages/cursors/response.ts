import {CursorInterface} from "./service";

export interface CursorPaginationResponseInterface<T> {
    message: string;
    cursor: CursorInterface;
    data: T[]
}

export class CursorResponse {
    public constructor() {
    }

    public static success<T>(params: { message: string, data: T[], cursor: CursorInterface }): CursorPaginationResponseInterface<T> {
        return { message: params.message, data: params.data, cursor: params.cursor }
    }
}