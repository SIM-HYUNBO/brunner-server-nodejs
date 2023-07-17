`use strict`

import * as database from './database/database'
import * as TB_COR_NOTIFICATION_ITEM from './database/sqls/TB_COR_NOTIFICATION_ITEM'

/* 사용자에게 푸시 알람을 생성함
1. 신규 대화항목를 만들었거나 기존 대화항목을 편집했을때 
 - 작성자 본인을 제외하고 해당 메인 대화에 댓글을 달았거나 메인 대화를 작성한 사람에게 (toUserIds)
2.특정 사용자에게 메시지를 직접 보내고자 할 경우
*/

export default async function createPushNotification(promisePool, jPushItem) {
    const fromSource = jPushItem.fromSource; // TALK_ITEM

    if (jPushItem.pushType == 'TALK_ITEM') {
        const systemCode = jPushItem.systemCode;
        const fromTalkItemIOd = jPushItem.fromSource;
        const toUserIds = jPushItem.toUserIds;

        await database.executeSQL(promisePool,
            TB_COR_NOTIFICATION_ITEM.insert_TB_COR_NOTIFICATION_ITEM_01,
            [
                systemCode,
                fromSource,
                systemCode,
                fromSource
            ]).then((result) => {
                console.log(`==========================\nRESULT:\n${JSON.stringify(result[0])}`);
            }).catch((e) => {
                console.log(e)
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
