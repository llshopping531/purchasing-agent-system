import { postApi } from '../base-api'
import type { LoginReq, LoginRes } from './account-api-interfaces'

export const accountApi = {
  /**
   * 管理員登入
   * @param req - 帳號與密碼
   * @returns token、userId、role、customerId
   */
  login: async (req: LoginReq): Promise<LoginRes> => {
    return await postApi('/account/login', req)
  },
}
