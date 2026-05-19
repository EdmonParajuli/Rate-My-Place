import {
  Attributes,
  CreateOptions,
  GroupOption,
  IncludeOptions,
  Order,
  Transaction,
  WhereOptions,
} from "sequelize";
import { Database } from "../config";
import { AuthUserDTO } from "../dto/authUserDTO";

interface RepositoryWriter<IT, RT> {
  create(input: Partial<IT>, include?: IncludeOptions): Promise<RT>;

  updateOne({
    id,
    input,
    include,
  }: {
    id: number | string;
    input: Partial<IT>;
    include: IncludeOptions[];
  }): Promise<[number]>;

  deleteOne(id: number | string, transaction?: Transaction): Promise<number>;

  deleteMany({
    where,
    transaction,
    force,
  }: {
    where: object;
    transaction?: Transaction;
    force?: boolean;
  }): Promise<number>;
}

interface RepositoryReader<IT, RT> {
  findAll({
    where,
    attributes,
    include,
    order,
  }: {
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[];
    order?: Order;
  }): Promise<RT[]>;

  findOne({
    where,
    attributes,
    include,
    order,
  }: {
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[];
    order?: Order;
  }): Promise<RT>;

  findByPk(
    id: number,
    options?: {
      attributes?: Attributes<any>;
      include?: IncludeOptions[];
    }
  ): Promise<RT>;

  findAndCountAll({
    where,
    attributes,
    include,
    order,
    offset,
    limit,
    distinct,
  }: {
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[];
    order?: Order;
    offset?: number;
    limit?: number;
    distinct?: boolean;
  }): Promise<{ count: number; rows: RT[] }>;

  count({ where }: { where?: WhereOptions }): Promise<number>;

  rawQuery(sql: string): Promise<any>;
}

export abstract class BaseRepository<IT, RT>
  implements RepositoryWriter<IT, RT>, RepositoryReader<IT, RT>
{
  constructor(
    public readonly model: any,
    private user?: AuthUserDTO
  ) {}

  findAll({
    where,
    attributes,
    include,
    order,
    group,
    limit,
    raw,
    having,
    subQuery,
  }: {
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[];
    order?: Order;
    group?: GroupOption;
    limit?: number;
    raw?: boolean;
    having?: WhereOptions<any>;
    subQuery?: boolean;
  }): Promise<RT[]> {
    return this.model.findAll({
      where,
      attributes,
      include,
      order,
      group,
      limit,
      raw,
      having,
      subQuery,
    });
  };

  async findOne({
    where,
    attributes,
    include,
    order,
    paranoid,
  }: {
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[];
    order?: Order;
    paranoid?: boolean;
  }): Promise<RT> {
    return this.model.findOne({
        where,
        attributes,
        include,
        order,
        paranoid
    })
  };

  findByPk(
    id: number,
    options?: {
        attributes?: Attributes<any>,
        include?: IncludeOptions[],
        order?: Order
    },
  ): Promise<RT>{
    return this.model.findByPk(id, options);
  };

  findAndCountAll({
    where,
    attributes,
    include,
    order,
    offset,
    limit,
    distinct
  }:{
    where?: WhereOptions<any>;
    attributes?: Attributes<any>;
    include?: IncludeOptions[],
    order?: Order,
    offset?: number,
    limit?: number,
    distinct?: boolean
  }): Promise<{count: number; rows: RT[]}>{
    return this.model.findAndCountAll({
        where,
        attributes,
        include,
        order,
        offset,
        limit,
        distinct
    })
  };

  count({
    where,
    include,
    distinct
  }:{
    where?: WhereOptions<any>;
    include?: IncludeOptions[];
    distinct?: boolean;
  }): Promise<number>{
    return this.model.count({where, include, distinct});
  };

  create(input: Partial<IT>, options?: CreateOptions): Promise<RT>{
    if(this.user){
        input = {
            ...input,
            createdById: this.user?.id,
            updatedById: this.user?.id,
        };
    }
    return this.model.create(input, options);
  }

  updateOne(
    {
      id,
      input,
      paranoid,
    }: {
      id: number | string;
      input: Partial<IT>;
      paranoid?: boolean;
    },
    options?: { transaction?: Transaction },
  ): Promise<[number]> {
    if (this.user) {
      input = {
        ...input,
        updatedById: this.user?.id,
      };
    }

    return this.model.update(input, {
      where: { id },
      paranoid,
      ...options, // Pass the transaction object if provided
    });
  }

  restore(id: number): Promise<number> {
    return this.model.restore({
      where: { id },
    });
  }

  rawQuery(sql: string): Promise<any> {
    return Database.sequelize.query(sql);
  }

  deleteOne(id: number | string, transaction?: Transaction): Promise<number> {
    return this.model.destroy({ where: { id }, transaction });
  }

  deleteMany({
    where,
    transaction,
    force = false,
  }: {
    where: object;
    transaction?: Transaction;
    force?: boolean;
  }): Promise<number> {
    return this.model.destroy({ where, force, transaction });
  }

}
