`use strict`

 export const select_TB_COR_TALK_CATEGORY_MST_01 = 
`SELECT SYSTEM_CODE, CATEGORY_ID, CATEGORY_NAME, CREATE_USER_ID
   FROM BRUNNER.TB_COR_TALK_CATEGORY_MST
  WHERE SYSTEM_CODE=?
  ORDER BY CREATE_TIME DESC
  LIMIT 0,10
 `
 ;

 export const select_TB_COR_TALK_CATEGORY_MST_02 = 
 `SELECT SYSTEM_CODE, CATEGORY_ID, CATEGORY_NAME, CREATE_USER_ID
    FROM BRUNNER.TB_COR_TALK_CATEGORY_MST
   WHERE SYSTEM_CODE=?
     AND CATEGORY_ID LIKE ?
   ORDER BY CREATE_TIME DESC
  `
  ;
