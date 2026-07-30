// import { describe, it, expect } from '@jest/globals';

// import {CursorBasedPagination, CursorInterface} from '@src/packages/cursors';

// describe('CursorResponse', () => {
//   const mockCursor: CursorInterface = {
//         hasNextPage: true,
//         hasPreviousPage: false,
//         startCursor: 'nextCursor123',
//         endCursor: 'prevCursor456',
//       },
//       mockData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
//       mockMessage = 'Success message';

//   describe('success method', () => {
//     it('should return a valid CursorPaginationResponseInterface object', () => {
//       const result = new CursorBasedPagination().getResponse({
//         message: mockMessage,
//         data: mockData,
//         cursor: mockCursor,
//       });

//       expect(result).toEqual({
//         message: mockMessage,
//         data: mockData,
//         cursor: mockCursor,
//       });
//       expect(result.message).toBe(mockMessage);
//       expect(result.data).toHaveLength(2);
//       expect(result.data).toEqual(mockData);
//       expect(result.cursor).toHaveProperty('startCursor', 'nextCursor123');
//       expect(result.cursor).toHaveProperty('endCursor', 'prevCursor456');
//     });

//     it('handles empty data array', () => {
//       const mockCursor: CursorInterface = {
//         hasNextPage: false,
//         hasPreviousPage: false,
//         startCursor: undefined,
//         endCursor: undefined,
//       };

//       const result = new CursorBasedPagination().getResponse({
//         message: mockMessage,
//         data: [],
//         cursor: mockCursor,
//       });

//       expect(result).toEqual({
//         message: mockMessage,
//         data: [],
//         cursor: mockCursor,
//       });
//       expect(result.data).toHaveLength(0);
//       expect(result.cursor).toEqual(mockCursor);
//     });

//     it('handles cursor with null properties', () => {
//       const nullCursor: CursorInterface = {
//         hasNextPage: false,
//         hasPreviousPage: false
//       }
//       const result = new CursorBasedPagination().getResponse({
//         message: mockMessage,
//         data: mockData,
//         cursor: nullCursor,
//       });

//       expect(result).toEqual({
//         message: mockMessage,
//         data: mockData,
//         cursor: nullCursor,
//       });
//       expect(result.cursor.startCursor).toBeUndefined()
//       expect(result.cursor.endCursor).toBeUndefined();
//     });

//     it('creates distinct instances for different inputs', () => {
//       const result1 = new CursorBasedPagination().getResponse({
//         message: 'First message',
//         data: [{ id: 1, name: 'Alice' }],
//         cursor: { hasNextPage: false, hasPreviousPage: false, startCursor: 'cursor1', endCursor: undefined },
//       });
//       const result2 = new CursorBasedPagination().getResponse({
//         message: 'Second message',
//         data: [{ id: 2, name: 'Bob' }],
//         cursor: { hasNextPage: false, hasPreviousPage: false, startCursor: 'cursor2', endCursor: undefined },
//       });

//       expect(result1).not.toEqual(result2);
//       expect(result1.message).toBe('First message');
//       expect(result2.message).toBe('Second message');
//       expect(result1.data[0].id).toBe(1);
//       expect(result2.data[0].id).toBe(2);
//       expect(result1.cursor.startCursor).toBe('cursor1');
//       expect(result2.cursor.startCursor).toBe('cursor2');
//     });

//     it('maintains type safety for generic data', () => {
//       interface TestData {
//         id: number;
//         value: string;
//       }
//       const typedData: TestData[] = [{ id: 1, value: 'Test' }];
//       const result = new CursorBasedPagination().getResponse<TestData>({
//         message: mockMessage,
//         data: typedData,
//         cursor: mockCursor,
//       });

//       expect(result.data).toEqual(typedData);
//       expect(result.data[0]).toHaveProperty('value', 'Test');
//       const item: TestData = result.data[0];
//       expect(item.value).toBe('Test');
//     });
//   });

//   describe('constructor', () => {
//     it('creates an instance without errors', () => {
//       const instance = new CursorBasedPagination();
//       expect(instance).toBeInstanceOf(new CursorBasedPagination());
//     });
//   });
// });
