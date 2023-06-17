`use strict`

import * as mysql from 'mysql2'
import * as database from './database/database'
import * as TB_COR_TALK_ITEM_MST from './database/sqls/TB_COR_TALK_ITEM_MST'

export default function executeService(req, jRequest){
  var jResponse = {};
 
  try {
  
    console.log(`mysql pool info
---------------------------------
host     : ${process.env.DATABASE_SERVER_IP},
user     : ${process.env.DATABASE_USER_NAME},
password : ${process.env.DATABASE_PASSWORD},
database : ${process.env.DATABASE_SCHEMA_NAME}`);

    const pool = mysql.createPool({
      host     : process.env.DATABASE_SERVER_IP,
      user     : process.env.DATABASE_USER_NAME,
      password : process.env.DATABASE_PASSWORD,
      database : process.env.DATABASE_SCHEMA_NAME
    });
    
    const promisePool = pool.promise();

    switch(jRequest.commandName){
      case "board.getTalkItems":
        jResponse = getTalkItems(promisePool, req, jRequest);
          break;
        default:
            break;
      }    
  } catch (error) {
    console.log(error);
  } finally {
    return jResponse;
  }
}

const getTalkItems = async (promisePool, req, jRequest) => {
    var jResponse = {};

    jResponse.commanaName = jRequest.commandName;
    jResponse.userId=jRequest.userId;
    jResponse.password=jRequest.password;

    console.log(`session info ${JSON.stringify(req.session)}`);

    if(jRequest.systemCode === undefined || jRequest.systemCode === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the systemCode field value is missing.`;
      return jResponse;
    }

    if(jRequest.talkCategory === '' || jRequest.talkCategory === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the talkCategory field value is missing.`;
      return jResponse;
    }

    if(jRequest.talkId === '' || jRequest.lastTalkId === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the talkId field value is missing.`;
      return jResponse;
    }

    if(jRequest.pageSize === undefined){
      jResponse.error_code = -2;
      jResponse.error_message = `the pageSize field value is missing.`;
      return jResponse;
    }


    await database.querySQL(promisePool, 
                            TB_COR_TALK_ITEM_MST.select_TB_COR_TALK_ITEM_MST_01, 
                            [
                              jRequest.systemCode,
                              jRequest.talkCategory,
                              jRequest.lastTalkId,
                              jRequest.pageSize,
                            ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0; 
        jResponse.error_message = ``;
        jResponse.talkItems = result[0];
  }).catch((e)=>{
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
        // console.log(jResponse);
    });

    return jResponse;
};