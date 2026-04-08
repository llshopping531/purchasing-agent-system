import { getApi, patchApi, postApi } from '../base-api'
import type {
  PurchaseCheckReq,
  PurchaseListAllRes,
  QueryPurchaseDetailReq,
  QueryPurchaseDetailRes,
} from './purchase-api-interface'

/** 採購清單相關 API 集合 */
export const purchaseListApi = {
  /**
   * 依活動 ID 取得採購統計清單（依通路分組）
   * @param id - 活動 ID
   * @returns 以通路名稱為 key 的採購統計物件
   */
  getPurchaseListsAll: async (id: number): Promise<PurchaseListAllRes> => {
    return await getApi('/stats/purchase-stats', { eventId: id })
  },

  /**
   * 查詢採購明細（單一商品）
   * @param req - 包含活動 ID 、通路 ID、商品 ID 的查詢參數
   * @returns 以通路名稱為 key 的採購統計物件
   */
  getPurchassDetail: async (req: QueryPurchaseDetailReq): Promise<QueryPurchaseDetailRes> => {
    return await getApi('/stats/purchase-stats/detail', req)
  },

  /**
   * 處理採購：標記訂單為已購買
   * @param req - 包含 商品 ID、採購數量 的查詢參數
   */
  purchaseCheck: async (req: PurchaseCheckReq): Promise<void> => {
    return await postApi(`/orders/purchase`, req)
  },
}
