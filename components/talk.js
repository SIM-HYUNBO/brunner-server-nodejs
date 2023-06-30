`use strict`

import * as database from './database/database'
import * as TB_COR_TALK_ITEM_MST from './database/sqls/TB_COR_TALK_ITEM_MST'
import * as TB_COR_TALK_CATEGORY_MST from './database/sqls/TB_COR_TALK_CATEGORY_MST'

export default function executeService(req, jRequest){
  var jResponse = {};
 
  try {    
    const promisePool = database.getPool().promise();

    switch(jRequest.commandName){
      case "talk.getTalkItems":
        jResponse = getTalkItems(promisePool, req, jRequest);
        break;
      case "talk.createTalkItem":
        jResponse = createTalkItem(promisePool, req, jRequest);
        break;        
      case "talk.editTalkItem":
        jResponse = editTalkItem(promisePool, req, jRequest);
        break;
      case "talk.getUserCategories":
        jResponse = getUserCategories(promisePool, req, jRequest);
        break  
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

    if(typeof jRequest.systemCode == "undefined" || jRequest.systemCode === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the systemCode field value is missing.`;
      return jResponse;
    }

    if(typeof jRequest.talkCategory == "undefined" || jRequest.talkCategory === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the talkCategory field value is missing.`;
      return jResponse;
    }

    if(typeof jRequest.lastTalkId == "undefined" || jRequest.lastTalkId === ''){
      jResponse.error_code = -2;
      jResponse.error_message = `the talkId field value is missing.`;
      return jResponse;
    }

    if(typeof jRequest.pageSize == "undefined"){
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

const createTalkItem = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId=jRequest.userId;
 
  console.log(`session info ${JSON.stringify(req.session)}`);

  if(typeof jRequest.systemCode == "undefined" || jRequest.systemCode === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.talkCategory == "undefined" || jRequest.talkCategory === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the talkCategory field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.title == "undefined" || jRequest.title === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    return jResponse;
  }


  if(typeof jRequest.content == "undefined" || jRequest.content === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    return jResponse;
  }

  const talkId = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3) + '_' + jRequest.userId;
  // console.log();
  // const content = jRequest.content.join("\n");
  // console.log(content);
   await database.executeSQL(promisePool, 
                          TB_COR_TALK_ITEM_MST.insert_TB_COR_TALK_ITEM_MST_01, 
                          [
                            jRequest.systemCode,
                            talkId,
                            jRequest.userId,
                            jRequest.title,
                            JSON.stringify(jRequest.content),
                            jRequest.talkCategory
                          ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0; 
      jResponse.error_message = ``;
      jResponse.talkItems = result[0];
}).catch((e)=>{
    jResponse.error_code = -3; // exception
    jResponse.error_message = e;
  }).finally(() => {
    //  console.log(jResponse);
  });

  return jResponse;
};

const editTalkItem = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId=jRequest.userId;
 
  console.log(`session info ${JSON.stringify(req.session)}`);

  if(typeof jRequest.systemCode == "undefined" || jRequest.systemCode === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.talkCategory == "undefined" || jRequest.talkCategory === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the talkCategory field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.title == "undefined" || jRequest.title === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    return jResponse;
  }


  if(typeof jRequest.content == "undefined" || jRequest.content === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.talkId == "undefined" || jRequest.talkId === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    return jResponse;
  }

  if(jRequest.talkId.endsWith(`_${jRequest.userId}`) == false){
    jResponse.error_code = -4;
    jResponse.error_message = "Editing this talk is not permitted.";

    alert("");
    return;
  }

   await database.executeSQL(promisePool, 
                          TB_COR_TALK_ITEM_MST.update_TB_COR_TALK_ITEM_MST_01, 
                          [
                            jRequest.title,
                            JSON.stringify(jRequest.content),
                            jRequest.systemCode,
                            jRequest.talkId
                          ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0; 
      jResponse.error_message = ``;
      jResponse.talkItems = result[0];
}).catch((e)=>{
    jResponse.error_code = -3; // exception
    jResponse.error_message = e;
  }).finally(() => {
    //  console.log(jResponse);
  });

  return jResponse;
};

const getUserCategories = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId=jRequest.userId;
  jResponse.password=jRequest.password;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if(typeof jRequest.systemCode == "undefined" || jRequest.systemCode === ''){
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if(typeof jRequest.userId == "undefined" || 
     jRequest.userId == "undefined" || 
     jRequest.userId === ''){
    await database.querySQL(promisePool, 
      TB_COR_TALK_CATEGORY_MST.select_TB_COR_TALK_CATEGORY_MST_01, 
      [
        jRequest.systemCode
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0; 
        jResponse.error_message = ``;
        jResponse.others_categories = result[0];
        jResponse.users_categories = [];
      }).catch((e)=>{
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
      // console.log(jResponse);
      });
  } else {
    await database.querySQL(promisePool, 
      TB_COR_TALK_CATEGORY_MST.select_TB_COR_TALK_CATEGORY_MST_02, 
      [
        jRequest.systemCode,
        jRequest.userId + '_%'
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0; 
        jResponse.error_message = ``;
        jResponse.users_categories = result[0];
      }).catch((e)=>{
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
      // console.log(jResponse);
      });

      await database.querySQL(promisePool, 
        TB_COR_TALK_CATEGORY_MST.select_TB_COR_TALK_CATEGORY_MST_03, 
        [
          jRequest.systemCode,
          jRequest.userId + '_%'
        ]).then((result) => {
          console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
          jResponse.error_code = 0; 
          jResponse.error_message = ``;
          jResponse.others_categories = result[0];
        }).catch((e)=>{
          jResponse.error_code = -3; // exception
          jResponse.error_message = e;
        }).finally(() => {
        // console.log(jResponse);
        });  
  }
  
  return jResponse;
};