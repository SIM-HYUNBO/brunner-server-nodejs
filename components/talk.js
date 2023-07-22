`use strict`

import * as database from './database/database'
import * as TB_COR_TALK_ITEM_MST from './database/sqls/TB_COR_TALK_ITEM_MST'
import * as TB_COR_USER_MST from './database/sqls/TB_COR_USER_MST'
import * as TB_COR_TALK_MST from './database/sqls/TB_COR_TALK_MST'
import createPush from './push-notification'
import createPushNotification from './push-notification'

export default function executeService(req, jRequest) {
  var jResponse = {};

  try {
    const promisePool = database.getPool().promise();

    switch (jRequest.commandName) {
      case "talk.getTalkItems":
        jResponse = getTalkItems(promisePool, req, jRequest);
        break;
      case "talk.createTalkItem":
        jResponse = createTalkItem(promisePool, req, jRequest);
        break;
      case "talk.editTalkItem":
        jResponse = editTalkItem(promisePool, req, jRequest);
        break;
      case "talk.getUserTalks":
        jResponse = getUserTalks(promisePool, req, jRequest);
        break
      case "talk.createTalk":
        jResponse = createTalk(promisePool, req, jRequest);
        break
      default:
        throw ('Not supported command name')
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
  jResponse.userId = jRequest.userId;
  jResponse.password = jRequest.password;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if (typeof jRequest.systemCode == "undefined" || jRequest.systemCode === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.talkId == "undefined" || jRequest.talkId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.lastTalkItemId == "undefined" || jRequest.lastTalkItemId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkItemId field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.pageSize == "undefined") {
    jResponse.error_code = -2;
    jResponse.error_message = `the pageSize field value is missing.`;
    return jResponse;
  }


  await database.querySQL(promisePool,
    TB_COR_TALK_ITEM_MST.select_TB_COR_TALK_ITEM_MST_01,
    [
      jRequest.systemCode,
      jRequest.talkId,
      jRequest.lastTalkItemId,
      jRequest.pageSize,
    ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
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
  jResponse.userId = jRequest.talkItemUserId;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if (typeof jRequest.systemCode == "undefined" || jRequest.systemCode === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.talkId == "undefined" || jRequest.talkId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.talkItemTitle == "undefined" || jRequest.talkItemTitle === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    return jResponse;
  }


  if (typeof jRequest.talkItemContent == "undefined" || jRequest.talkItemContent === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    return jResponse;
  }

  const talkItemId = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3) + '_' + jRequest.talkItemUserId;
  // console.log();
  // const content = jRequest.content.join("\n");
  // console.log(content);
  await database.executeSQL(promisePool,
    TB_COR_TALK_ITEM_MST.insert_TB_COR_TALK_ITEM_MST_01,
    [
      jRequest.systemCode,
      talkItemId,
      jRequest.talkItemUserId,
      jRequest.talkItemTitle,
      JSON.stringify(jRequest.talkItemContent),
      jRequest.talkId
    ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  console.log(jResponse);
      checkCreatePushNotification(promisePool, jRequest.systemCode, talkItemId);
    });

  return jResponse;
};

const editTalkItem = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.talkItemUserId;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if (typeof jRequest.systemCode == "undefined" ||
    jRequest.systemCode == "undefined" ||
    jRequest.systemCode === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    console.log(jResponse.error_message);
    return jResponse;
  }

  if (typeof jRequest.talkItemId == "undefined" ||
    jRequest.talkItemId == "undefined" ||
    jRequest.talkItemId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    console.log(jResponse.error_message);
    return jResponse;
  }

  if (typeof jRequest.talkItemTitle == "undefined" ||
    jRequest.talkItemTitle == "undefined" ||
    jRequest.talkItemTitle === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    console.log(jResponse.error_message);
    return jResponse;
  }

  if (typeof jRequest.talkItemContent == "undefined" ||
    jRequest.talkItemContent == "undefined" ||
    jRequest.talkItemContent === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    console.log(jResponse.error_message);
    return jResponse;
  }

  if (typeof jRequest.talkId == "undefined" ||
    jRequest.talkId == "undefined" ||
    jRequest.talkId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    console.log(jResponse.error_message);
    return jResponse;
  }

  if (jRequest.talkItemId.endsWith(`_${jRequest.talkItemUserId}`) == false) {
    jResponse.error_code = -4;
    jResponse.error_message = "Editing this talk is not permitted.";
    console.log(jResponse.error_message);
    return;
  }

  await database.executeSQL(promisePool,
    TB_COR_TALK_ITEM_MST.update_TB_COR_TALK_ITEM_MST_01,
    [
      jRequest.talkItemTitle,
      JSON.stringify(jRequest.talkItemContent),
      jRequest.systemCode,
      jRequest.talkItemId
    ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  console.log(jResponse);
      checkCreatePushNotification(promisePool, jRequest.systemCode, jRequest.talkItemId);
    });

  return jResponse;
};

const getUserTalks = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.userId;
  jResponse.password = jRequest.password;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if (typeof jRequest.systemCode == "undefined" || jRequest.systemCode === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.userId == "undefined" ||
    jRequest.userId == "undefined" ||
    jRequest.userId === '') {
    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_01,
      [
        jRequest.systemCode
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.others_talks = result[0];
        jResponse.users_talks = [];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // console.log(jResponse);
      });
  } else {
    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_02,
      [
        jRequest.systemCode,
        jRequest.userId + '_%'
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.users_talks = result[0];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // console.log(jResponse);
      });

    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_03,
      [
        jRequest.systemCode,
        jRequest.userId + '_%'
      ]).then((result) => {
        console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.others_talks = result[0];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // console.log(jResponse);
      });
  }

  return jResponse;
};

const createTalk = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.userId;

  console.log(`session info ${JSON.stringify(req.session)}`);

  if (typeof jRequest.systemCode == "undefined" ||
    jRequest.systemCode == "undefined" ||
    jRequest.systemCode === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.userId == "undefined" ||
    jRequest.userId == "undefined" ||
    jRequest.userId === '') {
    jResponse.error_code = -2;
    jResponse.error_message = `the userId field value is missing.`;
    return jResponse;
  }

  if (typeof jRequest.talkName == "undefined" ||
    jRequest.talkName === '' ||
    jRequest.talkName == "undefined") {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkName field value is missing.`;
    return jResponse;
  }

  await database.executeSQL(promisePool,
    TB_COR_TALK_MST.insert_TB_COR_TALK_MST_01,
    [
      jRequest.systemCode,
      `${jRequest.userId}_${jRequest.talkName}`,
      jRequest.talkName,
      jRequest.userId
    ]).then((result) => {
      console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  console.log(jResponse);
    });

  return jResponse;
};

const checkCreatePushNotification = async (promisePool, systemCode, talkItemId) => {
  // 본인 자신을 제외하고 인자로 넘어온 talkItemId의 메인 talkId에 참여한 사람 모두 (작성자 포함)

  const jPushItem = {};
  jPushItem.systemCode = systemCode;
  jPushItem.pushType = 'TALK_ITEM';
  jPushItem.fromSource = talkItemId;
  jPushItem.toUserIds = await getToUserIds(promisePool, systemCode, talkItemId);
  if (jPushItem.toUserIds.length > 0)
    createPushNotification(promisePool, jPushItem);
};

const getToUserIds = async (promisePool, systemCode, talkItemId) => {
  // talkItemId가 생성 또는 수정되었을때 push  메시지를 전송해야 하는 사용자의 목록을 조회

  let result = await database.querySQL(promisePool,
    TB_COR_TALK_ITEM_MST.select_TB_COR_TALK_ITEM_MST_02,
    [
      systemCode,
      talkItemId,
      systemCode,
      talkItemId
    ]);
  if (result[0].length >= 0) {
    // console.log(`${result[0].PASSWORD},${jRequest.password}`)
    let newArr = result[0].map(function add(item) {
      return item.TO_USER_ID;
    });
    return newArr;
  } else {
    return [];
  }
}