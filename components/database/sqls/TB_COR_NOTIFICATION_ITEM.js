`use strict`

export const insert_TB_COR_NOTIFICATION_ITEM_01 =
  `INSERT INTO BRUNNER.TB_COR_NOTIFICATION_ITEM
  (SYSTEM_CODE, TO_USER_ID, PUSH_TYPE, PUSH_TIME, FROM_SOURCE, CONTENT) 
   SELECT DISTINCT A.SYSTEM_CODE, A.TO_USER_ID, A.PUSH_TYPE, A.PUSH_TIME, A.FROM_SOURCE, A.CONTENT
     FROM (
   SELECT DISTINCT TIM.SYSTEM_CODE, TIM2.TALK_ITEM_USER_ID TO_USER_ID, 'TALK_ITEM' AS PUSH_TYPE, NOW() PUSH_TIME, TIM.TALK_ITEM_ID AS FROM_SOURCE, TIM.TALK_ITEM_TITLE AS CONTENT
    FROM BRUNNER.TB_COR_TALK_ITEM_MST TIM
   INNER JOIN BRUNNER.TB_COR_TALK_ITEM_MST TIM2
      ON TIM2.SYSTEM_CODE = TIM.SYSTEM_CODE
     AND TIM2.TALK_ID = TIM.TALK_ID
     AND TIM2.TALK_ITEM_USER_ID <> TIM.TALK_ITEM_USER_ID
   WHERE TIM.SYSTEM_CODE = ?
     AND TIM.TALK_ITEM_ID = ?
   UNION ALL
   SELECT TM.SYSTEM_CODE, TM.CREATE_USER_ID TO_USER_ID, 'TALK_ITEM' AS PUSH_TYPE, NOW() PUSH_TIME, TIM.TALK_ITEM_ID AS FROM_SOURCE, TIM.TALK_ITEM_TITLE AS CONTENT
     FROM BRUNNER.TB_COR_TALK_ITEM_MST TIM
   INNER JOIN BRUNNER.TB_COR_TALK_MST TM
      ON TM.SYSTEM_CODE = TIM.SYSTEM_CODE
     AND TM.TALK_ID = TIM.TALK_ID
     AND TM.CREATE_USER_ID <> TIM.TALK_ITEM_USER_ID
    WHERE TIM.SYSTEM_CODE = ?
     AND TIM.TALK_ITEM_ID = ?) A`
  ;

