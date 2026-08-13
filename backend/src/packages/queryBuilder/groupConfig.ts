export class GroupConfig {
    public constructor() {
    }

    public static relatedData<IT extends Record<number | string, any>, OT>(results: IT[], relatedOutputKeys: string[]): OT[] {
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
}
