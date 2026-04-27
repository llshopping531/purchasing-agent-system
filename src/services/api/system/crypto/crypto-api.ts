import { getApi } from '../../base-api'

export const cryptoApiService = {
  /**
   * 獲取 RSA 公鑰
   * @returns RSA 公鑰
   */
  getPublicKey: async (): Promise<string> => {
    return await getApi('/crypto/public-key')
  },
}
