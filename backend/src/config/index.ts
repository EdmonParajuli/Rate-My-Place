import sequelize from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const mustExist = <T>(value: T | undefined, name: string): T => {
    if (!value) {
      console.error(`Missing Config: ${name} !!!`);
      process.exit(1);
    }
    return value;
  };

export const port = mustExist(+process.env.PORT!, "PORT") as number,
  db = {
    username: mustExist(process.env.DB_USER!, "DB_USER"),
    password: mustExist(process.env.DB_PASSWORD!, "DB_PASSWORD"),
    name: mustExist(process.env.DB_NAME!, "DB_NAME"),
    host: mustExist(process.env.DB_HOST!, "DB_HOST"),
    dialect: mustExist(process.env.DB_DIALECT!, "DB_DIALECT"),
    port: mustExist(+process.env.DB_PORT!, "DB_PORT"),
    logging: false,
    timezone: "utc",
  } as {
    username: string;
    password: string;
    name: string;
    host: string;
    dialect: sequelize.Dialect;
    port: number;
    logging: boolean;
    timezone: string;
  };


export * from './instance';