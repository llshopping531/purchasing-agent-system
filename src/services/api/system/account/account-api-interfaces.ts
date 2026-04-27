/** POST /api/admin/account/login - 請求 body */
export interface LoginReq {
  /** 帳號 */
  account: string
  /** 密碼 */
  password: string
}

/** POST /api/admin/account/login - 回應資料 */
export interface LoginRes {
  /** JWT Token */
  token: string
  /** 使用者 ID */
  userId: number
  /** 角色（e.g. ROLE_ADMIN） */
  role: string
  /** 客戶 ID */
  customerId: number
}
