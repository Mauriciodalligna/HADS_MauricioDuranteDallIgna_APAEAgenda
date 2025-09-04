import { Sequelize } from "sequelize";

const {
  DATABASE_URL,
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_NAME = "apaeagenda",
  DB_USER = "postgres",
  DB_PASSWORD = "Mauro321",
  NODE_ENV,
} = process.env;

const logging = NODE_ENV === "development" ? console.log : false;

export const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, {
      dialect: "postgres",
      logging,
      dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false },
      },
    })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: Number(DB_PORT),
      dialect: "postgres",
      logging,
    });

export async function verifyDatabaseConnection() {
  await sequelize.authenticate();
  return true;
}

export default sequelize;


