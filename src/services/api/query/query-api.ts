import { getApi } from '../base-api'
import type { GetQueryCustomerRes, GetQueryOrdersEnrichedRes } from './query-api-interfaces'

/** 公開查詢連結相關 API 集合（不需登入） */
export const queryApi = {
  /**
   * 查詢客戶充實後的訂單列表（已過濾隱藏活動）
   * @param queryUuid - 客戶查詢連結的唯一識別碼
   * @returns 該客戶的訂單清單
   */
  getOrdersWithEnrichment: async (queryUuid: string): Promise<GetQueryOrdersEnrichedRes> => {
    return await getApi(`/public/query/${queryUuid}/orders-with-enrichment`, undefined, true)
  },

  /**
   * 透過 queryUuid 查詢客戶基本資料
   * @param queryUuid - 客戶查詢連結的唯一識別碼
   * @returns 客戶基本資料
   */
  getCustomer: async (queryUuid: string): Promise<GetQueryCustomerRes> => {
    return await getApi(`/public/query/${queryUuid}`, undefined, true)
  },
}
