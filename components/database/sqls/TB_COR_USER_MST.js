`use strict`

export const select_TB_COR_USER_MST_01 =
  `SELECT SYSTEM_CODE, USER_ID, PASSWORD, USER_NAME
  FROM BRUNNER.TB_COR_USER_MST
 WHERE USER_ID = ?
 `
  ;

export const update_TB_COR_USER_MST_01 =
  `UPDATE BRUNNER.TB_COR_USER_MST 
     SET PASSWORD = ?
   WHERE USER_ID = ?
     AND REGISTER_NO = ?
     AND PHONE_NUMBER = ?
     AND PASSWORD != ?
   `
  ;

export const insert_TB_COR_USER_MST_01 =
  `INSERT INTO BRUNNER.TB_COR_USER_MST
    (SYSTEM_CODE, USER_ID, PASSWORD, USER_NAME, ADDRESS, 
     PHONE_NUMBER, EMAIL_ID, REGISTER_NO, USE_FLAG, CREATE_USER_ID, 
     CREATE_TIME, UPDATE_USER_ID, UPDATE_TIME)
   VALUES
    (?, ?, ?, ?, ?,
     ?, ?, ?, ?, ?,
     SYSDATE(), NULL, NULL)
    `
  ;  