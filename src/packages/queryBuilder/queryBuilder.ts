// SQL INJECTION RISK - NOT WIRED UP TO ANYTHING IN THIS REPO.
// build() below constructs SQL by string-interpolating where-clause values
// directly into the query text (see buildConditionClauses), with no
// parameterization or escaping. Do not call this with any value that isn't
// fully trusted/hardcoded - a client-supplied search string or cursor value
// passed through here is exploitable. This repo's own pagination
// (src/repositories/reviewRepository.ts) is built on Sequelize's where/Op
// instead, which parameterizes automatically.
const maxCallBackConditionClauses: number = 5;

export enum SortEnum {
    Desc = "DESC",
    Asc = "ASC",
}

export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL" | "LEFT OUTER" | "RIGHT OUTER" | "FULL OUTER";

export type ComparisonOperatorType = "=" | "!=" | "<>" | ">" | "<" | ">=" | "<=" | "IS NULL" | "IS NOT NULL";

export type LogicalOperatorType = "AND" | "OR" | "NOT";

export type PatternMatchingType = "LIKE" | "ILIKE" | "SIMILAR TO";

export type SetOperatorType = "IN" | "NOT IN" | "EXISTS" | "NOT EXISTS";

export type ArithmeticOperatorType = "+" | "-" | "*" | "/" | "%";

export type WhereType = "single" | "nested";

export type WhereOperatorType = ComparisonOperatorType | PatternMatchingType | SetOperatorType;

export type WhereContentType = number | string | Date | Boolean | WhereContentType[];

export type SelectType = string | SubQuerySelectInterface;

interface SubQuerySelectInterface {
    filed?: string;
    subQuery?: QueryBuilderInterface;
    alias: string;
    type: "EXISTS" | "NOT EXISTS" | "COUNT";
}

interface WhereQueryInterface {
    type: WhereType;
    logicalOperator: LogicalOperatorType;
    operator?: WhereOperatorType;
    filed?: string;
    content?: WhereContentType | WhereQueryInterface[];
}

interface JoinConditionInterface {
    left: string;
    operator: ComparisonOperatorType;
    right: string;
}

interface FromQueryInterface {
    table: string | { subQuery: QueryBuilder };
    alias: string;
}

interface QueryPartInterface {
    select: SelectType[];
    from?: FromQueryInterface;
    softDelete: boolean;
    joins: { table: string | { subQuery: QueryBuilder }, alias: string, type: JoinType, conditions: (JoinConditionInterface | string)[] }[];
    where: WhereQueryInterface[];
    orderBy: { column: string, order: SortEnum }[];
    limit?: number;
    offset?: number;
    subQuery: boolean;
    distinctOn: string[];
}


export interface QueryBuilderInterface {
    select(attributes: string[]): QueryBuilderInterface;
    from(table: string, alias: string): QueryBuilderInterface;
    fromSubquery(subQueryBuilder: QueryBuilder, alias: string): QueryBuilderInterface;
    softDelete(): QueryBuilderInterface
    join(type: JoinType, table: string | { subQuery: QueryBuilder}, alias: string, conditions: (JoinConditionInterface | string)[]): QueryBuilderInterface;
    distinctOn(filed: string | string[]): QueryBuilderInterface;
    andWhere(filed: string, operator: ComparisonOperatorType | PatternMatchingType, value?: string | number | Date): QueryBuilderInterface;
    orWhere(filed: string, operator: ComparisonOperatorType | PatternMatchingType, value?: string | number | Date): QueryBuilderInterface;
    andWhereNull(filed: string): QueryBuilderInterface;
    orWhereNull(filed: string): QueryBuilderInterface;
    andWhereNotNull(filed: string): QueryBuilderInterface;
    orWhereNotNull(filed: string): QueryBuilderInterface;
    andWhereIn(filed: string, value?: (string | number | Date)[]): QueryBuilderInterface;
    andWhereNotIn(filed: string, value?: (string | number | Date)[]): QueryBuilderInterface;
    andWhereInSubquery(filed: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface;
    whereExists(alias: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface;
    whereNotExists(alias: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface;
    count(filed: string, alias: string): QueryBuilderInterface;

    andWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    orWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    notWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    andWhereNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    orWhereNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    andWhereNotNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    orWhereNotNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    andWhereInNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    notWhereInNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface;
    orderBy(column: string, order: SortEnum): QueryBuilderInterface;
    offset(count: number): QueryBuilderInterface;
    limit(count: number): QueryBuilderInterface;
    raw(query: string): string;
    build(): string;
}

export class QueryBuilder implements QueryBuilderInterface {
    private readonly queryParts: QueryPartInterface;

    public constructor() {
        this.queryParts = {
            select: [],
            from: undefined,
            softDelete: false,
            joins: [],
            where: [],
            orderBy: [],
            limit: undefined,
            offset: undefined,
            subQuery: false,
            distinctOn: [],
        };
    }

    public select(attributes: SelectType[]): QueryBuilderInterface {
        this.queryParts.select = attributes;
        return this;
    }

    public from(table: string, alias: string): QueryBuilderInterface {
        this.queryParts.from = { table: table, alias: alias };
        return this;
    }

    public fromSubquery(subQueryBuilder: QueryBuilder, alias: string): QueryBuilderInterface {
        subQueryBuilder.queryParts.subQuery = true;
        this.queryParts.from = { table: {subQuery: subQueryBuilder}, alias: alias };
        return this;
    }

    public softDelete(): QueryBuilderInterface {
        this.queryParts.softDelete = true;
        return this;
    }

    private where(type: WhereType, logicalOperator: LogicalOperatorType, filed?: string, operator?: WhereOperatorType, content?: WhereContentType | WhereQueryInterface[]): QueryBuilderInterface {
        this.queryParts.where.push({ type: type, logicalOperator: logicalOperator, filed: filed, operator: operator, content: content });
        return this;
    }

    public join(type: JoinType, table: string | { subQuery: QueryBuilder }, alias: string, conditions: JoinConditionInterface[]): QueryBuilderInterface {
        if (!this.queryParts.from || !this.queryParts.from.table || !this.queryParts.from.alias) {
            throw new Error('Table and alias is required for JOIN clause');
        }
        this.queryParts.joins.push({ table, alias, type, conditions });
        return this;
    }

    public distinctOn(filed: string | string[]): QueryBuilderInterface {
        if (Array.isArray(filed)) {
            this.queryParts.distinctOn.push(...filed)
        } else {
            this.queryParts.distinctOn.push(filed)
        }
        return this;
    }

    public andWhere(filed: string, operator: ComparisonOperatorType | PatternMatchingType, content?: string | number | Date | Boolean): QueryBuilderInterface {
        return this.where("single", "AND", filed, operator, content);
    }

    public orWhere(filed: string, operator: ComparisonOperatorType  | PatternMatchingType, content?:  string | number | Date | Boolean): QueryBuilderInterface {
        return this.where("single", "OR", filed, operator, content);
    }

    public andWhereNull(filed: string): QueryBuilderInterface {
        return this.where("single", "AND", filed, "IS NULL");
    }

    public orWhereNull(filed: string): QueryBuilderInterface {
        return this.where("single", "OR", filed, "IS NULL");
    }

    public andWhereNotNull(filed: string): QueryBuilderInterface {
        return this.where("single", "AND", filed, "IS NOT NULL");
    }

    public orWhereNotNull(filed: string): QueryBuilderInterface {
        return this.where("single", "OR", filed, "IS NOT NULL");
    }

    public andWhereIn(filed: string, values: (string | number | Date)[]): QueryBuilderInterface {
        return this.where("single", "AND", filed, "IN", values);
    }

    public andWhereNotIn(filed: string, values: (string | number | Date)[]): QueryBuilderInterface {
        return this.where("single", "AND", filed, "NOT IN", values);
    }

    public andWhereInSubquery(filed: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface {
        subQueryBuilder.queryParts.subQuery = true;
        return this.where("single", "AND", filed, "IN", subQueryBuilder.build());
    }

    public whereExists(alias: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface {
        subQueryBuilder.queryParts.subQuery = true;
        return this.select([{ type: "EXISTS", subQuery: subQueryBuilder, alias: alias }]);
    }

    public whereNotExists(alias: string, subQueryBuilder: QueryBuilder): QueryBuilderInterface {
        subQueryBuilder.queryParts.subQuery = true;
        return this.select([{ type: "EXISTS", subQuery: subQueryBuilder, alias: alias }]);
    }

    public count(filed: string, alias: string): QueryBuilderInterface {
        this.queryParts.select = [{ type: "COUNT", filed: filed, alias: alias }];
        return this;
    }

    public andWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "AND", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public orWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "OR", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public notWhereNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "NOT", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public andWhereNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "NOT", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public orWhereNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "NOT", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public andWhereNotNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "NOT", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public orWhereNotNullNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "OR", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public andWhereInNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "AND", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public notWhereInNested(callback: (cb: QueryBuilderInterface) => QueryBuilderInterface): QueryBuilderInterface {
        const nestedBuilder = new QueryBuilder();
        callback(nestedBuilder);
        const nestedConditions = nestedBuilder.queryParts.where;
        if (nestedConditions.length > 0) {
            this.where("nested", "NOT", undefined, undefined, nestedConditions);
        }
        return this;
    }

    public orderBy(column: string, order: SortEnum): QueryBuilderInterface {
        this.queryParts.orderBy.push({ column: column, order: order });
        return this;
    }

    public offset(count: number): QueryBuilderInterface {
        this.queryParts.offset = count;
        return this;
    }

    public limit(count: number): QueryBuilderInterface {
        this.queryParts.limit = count;
        return this;
    }

    public raw(query: string): string {
        return query.trim().replace(/\s+/g, ' ');
    }

    private buildWhereClauses(): string {
        let clause: string = " WHERE";
        clause += this.buildConditionClauses(this.queryParts.where);
        if (this.queryParts.softDelete && this.queryParts.from) {
            clause += ` AND ${this.queryParts.from.alias}.deleted_at IS NULL`
        }
        return clause;
    }

    private buildConditionClauses(conditions: WhereQueryInterface[], callback: number = 0): string {
        let clause = "";
        if (callback >= maxCallBackConditionClauses) {
            return clause;
        }
        for (const [index, condition] of conditions.entries()) {
            const prefix: string = index !== 0 ? ` ${condition.logicalOperator} ` : callback ? '' : ' ';
            if (condition.type === "single") {
                if (condition.content) {
                    if (condition.operator && ["IN", "NOT IN", "EXISTS", "NOT EXISTS"].includes(condition.operator)) {
                        if (Array.isArray(condition.content)) {
                            condition.content = condition.content.map(item => `'${item}'`).join(', ');
                        }
                        clause += `${prefix}${condition.filed} ${condition.operator} (${condition.content})`;
                    } else {
                        clause += `${prefix}${condition.filed} ${condition.operator} '${condition.content}'`;
                    }
                } else {
                    clause += `${prefix}${condition.filed} ${condition.operator}`;
                }
            } else if (condition.type === "nested" && Array.isArray(condition.content)) {
                clause += `${prefix}(${this.buildConditionClauses(condition.content! as WhereQueryInterface[], callback++)})`;
            }
        }
        return clause;
    }

    private buildOrderByClauses(): string {
        let clause: string = ' ORDER BY';
        for (const [index, orderBy] of this.queryParts.orderBy.entries()) {
            if (index === 0)
                clause += ` ${orderBy.column} ${orderBy.order}`;
            else
                clause += `, ${orderBy.column} ${orderBy.order}`;
        }
        return clause;
    }

    public build(): string {
        let query: string = '';

        if (this.queryParts.select.length || this.queryParts.distinctOn.length) {
            query += `SELECT `
            if (this.queryParts.distinctOn.length) {
                query += `DISTINCT ON (${this.queryParts.distinctOn.join(', ')}) `
            }
            if (this.queryParts.select.length) {
                const attributes = this.queryParts.select.map(item => {
                    if (typeof item === "string") {
                        return item;
                    } else {
                        if (item.type && item.subQuery && ["EXISTS", "NOT EXISTS"].includes(item.type)) {
                            return `EXISTS (${item.subQuery.build()}) AS ${item.alias}`;
                        } else {
                            return `COUNT(${item.filed}) AS ${item.alias}`;
                        }
                    }
                });
                query += `${attributes.join(', ')} `
            }
        }

        if (this.queryParts.from) {
            const fromTable: string = typeof this.queryParts.from.table === 'string' ? this.queryParts.from.table : `(${this.queryParts.from.table.subQuery.build()})`;
            if (this.queryParts.select.length) query += `FROM `;
            query += `${fromTable} AS ${this.queryParts.from.alias}`;
        }

        if (this.queryParts.joins.length) {
            for (const join of this.queryParts.joins) {
                if (typeof join.table !== "string") join.table.subQuery.queryParts.subQuery = true;
                const tableOrSubquery = typeof join.table === "string" ? join.table : `(${join.table.subQuery.build()})`,
                    aliasPart = join.alias ? ` AS ${join.alias}` : "",
                    conditions = join.conditions.map(cond => typeof cond === "string" ? cond : `${cond.left} ${cond.operator} ${cond.right}`).join(" AND ");
                query += ` ${join.type} JOIN ${tableOrSubquery}${aliasPart} ON ${conditions}`;
                if (!join.alias && typeof join.table !== "string") {
                    join.alias = join.table.subQuery.queryParts.from?.alias!;
                }
                if (this.queryParts.softDelete) {
                    query += ` AND ${join.alias}.deleted_at IS NULL`;
                }
            }
        }

        if (this.queryParts.where.length) {
            query += this.buildWhereClauses();
        }

        if (this.queryParts.orderBy.length) {
            query += this.buildOrderByClauses();
        }

        if (this.queryParts.limit) {
            query += ` LIMIT ${this.queryParts.limit}`;
        }

        if (this.queryParts.offset) {
            query += ` OFFSET ${this.queryParts.offset}`;
        }

        if (!this.queryParts.subQuery) {
            query += `;`
        }

        return query.replace(/\s+/g, ' ');
    }
}