`use strict`
import * as mysql from 'mysql2'

let pool = undefined;

export const getPool = () => {
  console.log(`mysql pool info
  ---------------------------------
  host     : ${process.env.DATABASE_SERVER_IP},
  user     : ${process.env.DATABASE_USER_NAME},
  password : ${process.env.DATABASE_PASSWORD},
  database : ${process.env.DATABASE_SCHEMA_NAME}`);

  if (pool === undefined) 
    pool = mysql.createPool({
      host     : process.env.DATABASE_SERVER_IP,
      user     : process.env.DATABASE_USER_NAME,
      password : process.env.DATABASE_PASSWORD,
      database : process.env.DATABASE_SCHEMA_NAME
    });

    return pool;
};

export const querySQL = async (promisePool, sql, params)=>{
  try{
    console.log(`
==================================================
SQL:\n${sql}
--------------------------------------------------
PARAMS:
    ${JSON.stringify(params)}`)
    
    const result = await promisePool.query(sql, params);
    return result;
  }
  catch(err){
    console.log(err);
    return err;
  }
};

export const executeSQL = async (promisePool, sql, params)=>{
  try{
    console.log(`
==================================================
SQL:\n${sql}\n
--------------------------------------------------
PARAMS:\n
    ${JSON.stringify(params)}`)
    
    const result = await promisePool.execute(sql, params);
    return result;
  }
  catch(err){
    console.log(err);
    return err;
  }
};
