import { getApi, patchApi } from '../base-api'
import type {
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
    return await getApi('/orders/purchase-stats', { eventId: id })
  },

  /**
   * 查詢採購明細（單一商品）
   * @param req - 包含活動 ID 、通路 ID、商品 ID 的查詢參數
   * @returns 以通路名稱為 key 的採購統計物件
   */
  getPurchassDetail: async (req: QueryPurchaseDetailReq): Promise<QueryPurchaseDetailRes> => {
    return await getApi('/orders/purchase-stats/detail', req)
  },

  /**
   * 查詢採購明細（單一商品）
   * @param req - 包含活動 ID 、通路 ID、商品 ID 的查詢參數
   * @returns 以通路名稱為 key 的採購統計物件
   */
  modifyOrderStatus: async (
    id: number,
    req: { orderStatus: string },
  ): Promise<QueryPurchaseDetailRes> => {
    return await patchApi(`/orders/${id}/status?orderStatus=${req.orderStatus}`)
  },
}
