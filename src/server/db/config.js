const { URL } = require('url');
require('dotenv').config();

function parseDatabaseUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    username: url.username,
    password: url.password,
    database: url.pathname.replace(/^\//, ''),
    host: url.hostname,
    port: url.port || '5432',
    dialect: 'postgres',
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  };
}

const common = process.env.DATABASE_URL
  ? parseDatabaseUrl(process.env.DATABASE_URL)
  : {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'Mauro321',
      database: process.env.DB_NAME || 'apaeagenda',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || '5432',
      dialect: 'postgres',
    };

module.exports = {
  development: common,
  test: common,
  production: common,
};
