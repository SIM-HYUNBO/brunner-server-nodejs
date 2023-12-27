`use strict`
import logger from "./../winston/Logger"
import * as database from './database/database'
import admin from "firebase-admin";
import serviceAccount from "./notification/brunner-push-7e0ef-firebase-adminsdk-ptyec-3892a26b45.json";

import * as TB_COR_NOTIFICATION_ITEM from './database/sqls/TB_COR_NOTIFICATION_ITEM'
import * as TB_COR_USER_MST from './database/sqls/TB_COR_USER_MST'

/* 사용자에게 푸시 알람을 보냄.
1. 신규 대화항목를 만들었거나 기존 대화항목을 편집했을때 작성자 본인을 제외하고 해당 메인 대화에 댓글을 달았거나 메인 대화를 작성한 사람(toUserIds)에게 보냄.
2.특정 사용자에게 메시지를 직접 보냄.
*/
let initialized = false;

export default async function createPushNotification(promisePool, jPushItem) {
    const fromSource = jPushItem.fromSource; // TALK_ITEM

    if (jPushItem.pushType == 'TALK_ITEM') {
        const systemCode = jPushItem.systemCode;
        const toUserIds = jPushItem.toUserIds;

        await database.executeSQL(promisePool,
            TB_COR_NOTIFICATION_ITEM.insert_TB_COR_NOTIFICATION_ITEM_01,
            [
                systemCode,
                fromSource,
                systemCode,
                fromSource
            ]).then((result) => {
                logger.log(`RESULT:\n${JSON.stringify(result[0])}`);
                pushMessage(promisePool, toUserIds, 'title', 'body', 'topic');
            }).catch((e) => {
                logger.error(e)
            }).finally(() => {
                //  console.log(jResponse);
            });
    } else if (pushType == 'DIRECT_MESSAGE') {
        const content = pushItem.content; // DIRECT_MESSAGE 내용

        toUserIds.map((toUserId) => {
            // Insert push data: toUserId, pushType, pushTime, fromSource, content
        })
    }
}

const pushMessage = async (promisePool, toUserIds, title, body, topic) => {
    if (initialized == false) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        initialized = true;
    }

    const messaging = admin.messaging();
    let userTokens = [];

    let result = await database.querySQL(promisePool,
        TB_COR_USER_MST.select_TB_COR_USER_MST_02,
        [
            toUserIds
        ]);

    logger.info(`RESULT:\n${JSON.stringify(result[0])}`);

    userTokens = result[0].map((token) => {
        return token.USER_TOKEN ? token.USER_TOKEN : '';
    });

    if (userTokens.length > 0) {
        var payload = {
            notification: {
                title: `${title}`,
                body: `${body}`
            },
            // topic: `/topics/all`,
            token: userTokens.join(','),
            // condition: ''
        };

        messaging.send(payload)
            .then((result) => {
                logger.info(result)
            }).catch((e) => {
                logger.error(e)
            }).finally(() => {
                //  console.log(jResponse);
            });
    }
}
