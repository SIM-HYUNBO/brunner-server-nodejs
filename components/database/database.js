`use strict`
import * as mysql from 'mysql2'
import logger from "./../../winston/Logger"

let pool = undefined;

export const getPool = () => {
  logger.info(`mysql pool info
  host     : ${process.env.DATABASE_SERVER_IP},
  user     : ${process.env.DATABASE_USER_NAME},
  password : ${process.env.DATABASE_PASSWORD},
  database : ${process.env.DATABASE_SCHEMA_NAME}`);

  if (!pool)
    pool = mysql.createPool({
      host: process.env.DATABASE_SERVER_IP,
      user: process.env.DATABASE_USER_NAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_SCHEMA_NAME
    });

  return pool;
};

export const querySQL = async (promisePool, sql, params) => {
  try {
    logger.info(`
SQL:\n${sql}
PARAMS:
    ${JSON.stringify(params)}`)

    const result = await promisePool.query(sql, params);
    return result;
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};

export const executeSQL = async (promisePool, sql, params) => {
  try {
    logger.info(`
SQL:\n${sql}\n
PARAMS:\n
    ${JSON.stringify(params)}`)

    const result = await promisePool.execute(sql, params);
    return result;
  }
  catch (err) {
    logger.error(err);
    return err;
  }
};
