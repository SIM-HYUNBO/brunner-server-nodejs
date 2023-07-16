`use strict`

import * as TB_COR_NOTIFICATION_ITEM from './database/sqls/TB_COR_NOTIFICATION_ITEM'

/* 사용자에게 푸시 알람을 생성함
1. 신규 대화항목를 만들었거나 기존 대화항목을 편집했을때 
 - 작성자 본인을 제외하고 해당 메인 대화에 댓글을 달았거나 메인 대화를 작성한 사람에게
2.특정 사용자에게 메시지를 직접 보내고자 할 경우
*/

export default function createPush(pushType, toUserIds, jPushItem) {
    const content = pushItem.content;
    const pushTime = new Date();
    const fromSource = jPushItem.fromUserId;

    if (pushType == 'TALK_ITEM') {
        fromSource = pushItem.fromTalkItemId;

        toUserIds.map((toUserId) => {
            // Insert push data: toUserId, pushType, pushTime, fromSource, content
        })
    } else if (pushType == 'DIRECT_MESSAGE') {
        toUserIds.map((toUserId) => {
            // Insert push data: toUserId, pushType, pushTime, fromSource, content
        })
    }
}
