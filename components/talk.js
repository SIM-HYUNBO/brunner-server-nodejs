`use strict`

import logger from "./../winston/Logger"
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
    logger.error(error);
  } finally {
    return jResponse;
  }
}

const getTalkItems = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.userId;
  jResponse.password = jRequest.password;

  logger.info(`session info ${JSON.stringify(req.session)}`);

  if (!jRequest.systemCode) {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (!jRequest.talkId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    return jResponse;
  }

  if (!jRequest.lastTalkItemId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkItemId field value is missing.`;
    return jResponse;
  }

  if (!jRequest.pageSize) {
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
      logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      // logger.info(jResponse);
    });

  return jResponse;
};

const createTalkItem = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.talkItemUserId;

  logger.info(`session info ${JSON.stringify(req.session)}`);

  if (!jRequest.systemCode) {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (!jRequest.talkId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    return jResponse;
  }

  if (!jRequest.talkItemTitle) {
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    return jResponse;
  }


  if (!jRequest.talkItemContent) {
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    return jResponse;
  }

  const talkItemId = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3) + '_' + jRequest.talkItemUserId;
  // logger.info();
  // const content = jRequest.content.join("\n");
  // logger.info(content);
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
      logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  logger.info(jResponse);
      checkPushNotification(promisePool, jRequest.systemCode, talkItemId);
    });

  return jResponse;
};

const editTalkItem = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.talkItemUserId;

  logger.info(`session info ${JSON.stringify(req.session)}`);

  if (!jRequest.systemCode) {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    logger.info(jResponse.error_message);
    return jResponse;
  }

  if (!jRequest.talkItemId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    logger.info(jResponse.error_message);
    return jResponse;
  }

  if (!jRequest.talkItemTitle) {
    jResponse.error_code = -2;
    jResponse.error_message = `the title field value is missing.`;
    logger.info(jResponse.error_message);
    return jResponse;
  }

  if (!jRequest.talkItemContent) {
    jResponse.error_code = -2;
    jResponse.error_message = `the content field value is missing.`;
    logger.info(jResponse.error_message);
    return jResponse;
  }

  if (!jRequest.talkId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the talkId field value is missing.`;
    logger.info(jResponse.error_message);
    return jResponse;
  }

  if (jRequest.talkItemId.endsWith(`_${jRequest.talkItemUserId}`) == false) {
    jResponse.error_code = -4;
    jResponse.error_message = "Editing this talk is not permitted.";
    logger.info(jResponse.error_message);
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
      logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  logger.info(jResponse);
      checkPushNotification(promisePool, jRequest.systemCode, jRequest.talkItemId);
    });

  return jResponse;
};

const getUserTalks = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.userId;
  jResponse.password = jRequest.password;

  logger.info(`session info ${JSON.stringify(req.session)}`);

  if (!jRequest.systemCode) {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (!jRequest.userId) {
    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_01,
      [
        jRequest.systemCode
      ]).then((result) => {
        logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.others_talks = result[0];
        jResponse.users_talks = [];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // logger.info(jResponse);
      });
  } else {
    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_02,
      [
        jRequest.systemCode,
        jRequest.userId + '_%'
      ]).then((result) => {
        logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.users_talks = result[0];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // logger.info(jResponse);
      });

    await database.querySQL(promisePool,
      TB_COR_TALK_MST.select_TB_COR_TALK_MST_03,
      [
        jRequest.systemCode,
        jRequest.userId + '_%'
      ]).then((result) => {
        logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
        jResponse.error_code = 0;
        jResponse.error_message = ``;
        jResponse.others_talks = result[0];
      }).catch((e) => {
        jResponse.error_code = -3; // exception
        jResponse.error_message = e;
      }).finally(() => {
        // logger.info(jResponse);
      });
  }

  return jResponse;
};

const createTalk = async (promisePool, req, jRequest) => {
  var jResponse = {};

  jResponse.commanaName = jRequest.commandName;
  jResponse.userId = jRequest.userId;

  logger.info(`session info ${JSON.stringify(req.session)}`);

  if (!jRequest.systemCode) {
    jResponse.error_code = -2;
    jResponse.error_message = `the systemCode field value is missing.`;
    return jResponse;
  }

  if (!jRequest.userId) {
    jResponse.error_code = -2;
    jResponse.error_message = `the userId field value is missing.`;
    return jResponse;
  }

  if (!jRequest.talkName) {
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
      logger.info(`RESULT:\n${JSON.stringify(result[0])}`);
      jResponse.error_code = 0;
      jResponse.error_message = ``;
      jResponse.result = result[0];
    }).catch((e) => {
      jResponse.error_code = -3; // exception
      jResponse.error_message = e;
    }).finally(() => {
      //  logger.info(jResponse);
    });

  return jResponse;
};

const checkPushNotification = async (promisePool, systemCode, talkItemId) => {
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
    // logger.info(`${result[0].PASSWORD},${jRequest.password}`)
    let newArr = result[0].map(function add(item) {
      return item.TO_USER_ID;
    });
    return newArr;
  } else {
    return [];
  }
}