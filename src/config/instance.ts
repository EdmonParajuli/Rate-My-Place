import sequelize from "sequelize";
import { db } from ".";

class Database {
  private static instance: Database;
  public sequelize: sequelize.Sequelize;
  private dialect: sequelize.Dialect;
  private dbname: string;
  private username: string;
  private password: string;
  private host: string;
  private port: number;
  private maxPool: number;
  private minPool: number;

  private constructor(){
    this.dialect = db.dialect;
    this.dbname = db.name;
    this.username = db.username;
    this.password = db.password;
    this.host = db.host;
    this.port = db.port;
    this.maxPool = 10;
    this.minPool = 1;

    this.sequelize = new sequelize.Sequelize(this.dbname, this.username, this.password, {
        host: this.host,
        dialect: this.dialect,
        dialectOptions: {
          encrypt: true,
        },
        port: this.port,
  
        logging: false,
        timezone: 'utc',
        pool: {
          max: this.maxPool,
          min: this.minPool,
          acquire: 30000,
          idle: 10000,
        },
        define: {
          timestamps: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  }
  static get(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connection(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      console.info(`${db.dialect} database connected`);
    } catch (error: any) {
      console.error(error.message);
      return error;
    }
  }
}

const database = Database.get();

export {database as Database};