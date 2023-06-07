`use strict`

import * as mysql from 'mysql2'

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
    return err;
  }
};
