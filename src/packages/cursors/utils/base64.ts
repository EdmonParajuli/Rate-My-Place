export class Base64 {
    public constructor() {
    }

    public static encode<T>(params: T): string {
        const json = JSON.stringify(params);
        return Buffer.from(json).toString('base64');
    }

    public static decode<T>(cursor: string): T {
        try {
            const json = Buffer.from(cursor, 'base64').toString('ascii'),
                parsed: T = JSON.parse(json);

            if (!parsed || Object.values(parsed).some(value => value === undefined || value === null)) {
                throw new Error('Invalid cursor');
            }
            return parsed;
        } catch (error) {
            throw new Error('Invalid cursor');
        }
    }
}