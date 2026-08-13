// import { describe, it, expect, jest } from '@jest/globals';

// import { CursorBasedPagination, CursorQueryParamsInterface, CursorQueryResponseInterface, CursorDataInterface, SortEnum, CursorDirectionEnum } from '../service';
// import {CursorPaginate} from '../paginate';
// import {CaseConverter, Base64} from '../utils';

// import { QueryBuilder } from '@src/packages/queryBuilder';

// jest.mock('@src/packages/queryBuilder', () => ({
//     QueryBuilder: jest.fn().mockImplementation(() => ({
//         andWhereNested: jest.fn().mockReturnThis(),
//         orWhereNested: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         orWhere: jest.fn().mockReturnThis(),
//         orderBy: jest.fn().mockReturnThis(),
//         limit: jest.fn().mockReturnThis(),
//     })),
// }));

// describe('CursorPaginate', () => {
//     describe('queryArguments', () => {
//         it('returns default values when params are empty', () => {
//             const params: CursorQueryParamsInterface = {};
//             const result = new CursorBasedPagination().validateParameters(params);
//             expect(result).toEqual({
//                 cursor: undefined,
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: false,
//                 limit: 10,
//                 cursorOrder: 'id',
//                 cursorSort: SortEnum.Asc,
//                 order: 'updatedAt',
//                 sort: SortEnum.Asc,
//             });
//         });

//         it('respects provided params and limits within bounds', () => {
//             const params: CursorQueryParamsInterface = {
//                 cursor: 'testCursor',
//                 direction: CursorDirectionEnum.Previous,
//                 withCursor: true,
//                 limit: 1500,
//                 order: 'createdAt',
//                 sort: SortEnum.Desc,
//             };
//             const result = new CursorBasedPagination().validateParameters(params);
//             expect(result).toEqual({
//                 cursor: 'testCursor',
//                 direction: CursorDirectionEnum.Previous,
//                 withCursor: true,
//                 limit: 1000,
//                 cursorOrder: 'id',
//                 cursorSort: SortEnum.Desc,
//                 order: 'createdAt',
//                 sort: SortEnum.Desc,
//             });
//         });
//     });

//     describe('encodeCursor', () => {
//         it('encodes cursor data to base64 string', () => {
//             const params: CursorDataInterface = { id: '123', sortValue: '2023-01-01' };
//             const result = Base64.encode(params);
//             expect(result).toBe(Buffer.from(JSON.stringify(params)).toString('base64'));
//         });
//     });

//     describe('decodeCursor', () => {
//         it('decodes valid base64 cursor to CursorDataInterface', () => {
//             const data: CursorDataInterface = { id: '123', sortValue: '2023-01-01' };
//             const cursor = Buffer.from(JSON.stringify(data)).toString('base64');
//             const result = Base64.decode(cursor);
//             expect(result).toEqual(data);
//         });

//         it('throws error for invalid cursor', () => {
//             expect(() => Base64.decode('invalid')).toThrow('Invalid cursor');
//         });

//         it('throws error for cursor with missing fields', () => {
//             const invalidData = { id: '123' };
//             const cursor = Buffer.from(JSON.stringify(invalidData)).toString('base64');
//             expect(() => Base64.decode(cursor)).toThrow('Invalid cursor');
//         });
//     });

//     describe('cursor', () => {
//         it('returns empty cursor for empty rows', () => {
//             const cursorQuery: CursorQueryResponseInterface = { limit: 10, order: 'updatedAt', direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', sort: SortEnum.Asc };
//             const result = new CursorBasedPagination().getNavigationCursors([], cursorQuery);
//             expect(result).toEqual({ hasNextPage: false, hasPreviousPage: false });
//         });

//         it('handles rows with next page and cursor', () => {
//             const rows = [
//                 { id: '1', updatedAt: '2023-01-01' },
//                 { id: '2', updatedAt: '2023-01-02' },
//                 { id: '3', updatedAt: '2023-01-03' },
//             ];
//             const cursorQuery: CursorQueryResponseInterface = { cursor: 'test', limit: 2, order: 'updatedAt', direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', sort: SortEnum.Asc };
//             const result = new CursorBasedPagination().getNavigationCursors(rows, cursorQuery);
//             expect(result.hasNextPage).toBe(true);
//             expect(result.hasPreviousPage).toBe(true);
//             expect(result.startCursor).toBeDefined();
//             expect(result.endCursor).toBeDefined();
//         });
//     });

//     describe('rows', () => {
//         it('returns limited rows in correct order', () => {
//             const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];
//             const cursorQuery: CursorQueryResponseInterface = { limit: 2, direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', order: 'updatedAt', sort: SortEnum.Asc };
//             const result = new CursorBasedPagination().getRows(rows, cursorQuery);
//             expect(result).toEqual([{ id: '1' }, { id: '2' }]);
//         });

//         it('reverses rows for previous direction', () => {
//             const rows = [{ id: '1' }, { id: '2' }, { id: '3' }];
//             const cursorQuery: CursorQueryResponseInterface = { limit: 3, direction: CursorDirectionEnum.Previous, withCursor: false, cursorSort: SortEnum.Desc, cursorOrder: 'id', order: 'updatedAt', sort: SortEnum.Asc };
//             const result = new CursorBasedPagination().getRows(rows, cursorQuery);
//             expect(result).toEqual([{ id: '3' }, { id: '2' }, { id: '1' }]);
//         });
//     });

//     describe('paginate', () => {
//         it('returns paginated data with cursor', () => {
//             const rows = [{ id: '1' }, { id: '2' }];
//             const cursorQuery: CursorQueryResponseInterface = { limit: 2, direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', order: 'updatedAt', sort: SortEnum.Asc };
//             const result = new CursorBasedPagination().paginate(rows, cursorQuery);
//             expect(result).toEqual({
//                 cursor: expect.any(Object),
//                 data: rows,
//             });
//         });
//     });

//     describe('camelToSnake', () => {
//         it('converts camelCase to snake_case', () => {
//             expect(CaseConverter.camelToSnake('updatedAt')).toBe('updated_at');
//             expect(CaseConverter.camelToSnake('myFieldName')).toBe('my_field_name');
//         });
//     });

//     describe('where', () => {
//         it('applies cursor-based where clause', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = {
//                 cursor: Base64.encode({ id: '123', sortValue: '2023-01-01' }),
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: true,
//                 limit: 10,
//                 cursorOrder: 'id',
//                 cursorSort: SortEnum.Asc,
//                 order: 'updatedAt',
//                 sort: SortEnum.Asc,
//             };
//             const result = CursorPaginate.where(queryBuilder, 't', params);
//             expect(queryBuilder.andWhereNested).toHaveBeenCalled();
//             expect(result).toBe(queryBuilder);
//         });

//         it('returns unchanged queryBuilder if no cursor', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = { limit: 10, direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', order: 'updatedAt', sort: SortEnum.Asc };
//             const result = CursorPaginate.where(queryBuilder, 't', params);
//             expect(queryBuilder.andWhereNested).not.toHaveBeenCalled();
//             expect(result).toBe(queryBuilder);
//         });
//     });

//     describe('search', () => {
//         it('applies search conditions for fields', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = {
//                 query: 'test',
//                 fields: ['name', 'description'],
//                 limit: 10,
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: false,
//                 cursorSort: SortEnum.Asc,
//                 cursorOrder: 'id',
//                 order: 'updatedAt',
//                 sort: SortEnum.Asc,
//             };
//             const result = CursorPaginate.search(queryBuilder, 't', params);
//             expect(queryBuilder.andWhereNested).toHaveBeenCalled();
//             // expect(queryBuilder.orWhere).toHaveBeenCalledWith('t.name', 'ILIKE', '%test%');
//             // expect(queryBuilder.orWhere).toHaveBeenCalledWith('t.description', 'ILIKE', '%test%');
//             expect(result).toBe(queryBuilder);
//         });

//         it('returns unchanged queryBuilder if no query or fields', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = { limit: 10, direction: CursorDirectionEnum.Next, withCursor: false, cursorSort: SortEnum.Asc, cursorOrder: 'id', order: 'updatedAt', sort: SortEnum.Asc };
//             const result = CursorPaginate.search(queryBuilder, 't', params);
//             expect(queryBuilder.andWhereNested).not.toHaveBeenCalled();
//             expect(result).toBe(queryBuilder);
//         });
//     });

//     describe('orderBy', () => {
//         it('applies orderBy clauses', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = {
//                 limit: 10,
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: false,
//                 cursorSort: SortEnum.Asc,
//                 cursorOrder: 'id',
//                 order: 'updatedAt',
//                 sort: SortEnum.Desc,
//             };
//             const result = CursorPaginate.orderBy(queryBuilder, 't', params);
//             expect(queryBuilder.orderBy).toHaveBeenCalledWith('t.updated_at', SortEnum.Desc);
//             expect(queryBuilder.orderBy).toHaveBeenCalledWith('t.id', SortEnum.Asc);
//             expect(result).toBe(queryBuilder);
//         });
//     });

//     describe('limit', () => {
//         it('applies limit clause', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = {
//                 limit: 10,
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: false,
//                 cursorSort: SortEnum.Asc,
//                 cursorOrder: 'id',
//                 order: 'updatedAt',
//                 sort: SortEnum.Asc,
//             };
//             const result = CursorPaginate.limit(queryBuilder, 't', params);
//             expect(queryBuilder.limit).toHaveBeenCalledWith(11);
//             expect(result).toBe(queryBuilder);
//         });
//     });

//     describe('cursorQuery', () => {
//         it('chains where, search, orderBy, and limit', () => {
//             const queryBuilder = new QueryBuilder();
//             const params: CursorQueryResponseInterface = {
//                 cursor: Base64.encode({ id: '123', sortValue: '2023-01-01' }),
//                 query: 'test',
//                 fields: ['name'],
//                 limit: 10,
//                 direction: CursorDirectionEnum.Next,
//                 withCursor: true,
//                 cursorSort: SortEnum.Asc,
//                 cursorOrder: 'id',
//                 order: 'updatedAt',
//                 sort: SortEnum.Asc,
//             };
//             const result = CursorPaginate.cursorQuery(queryBuilder, 't', params);
//             console.log(queryBuilder.orWhere)

//             expect(queryBuilder.andWhereNested).toHaveBeenCalled();
//             // expect(queryBuilder.orWhere).toHaveBeenCalled();
//             expect(queryBuilder.orderBy).toHaveBeenCalled();
//             expect(queryBuilder.limit).toHaveBeenCalled();
//             expect(result).toBe(queryBuilder);
//         });
//     });
// });