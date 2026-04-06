import { getApi } from './base-api'

/**
 * 採購清單回應結構
 * key 為通路名稱，value 為該通路的採購明細陣列
 */
export interface PurchaseListRes {
  [key: string]: AdditionalProp[]
  additionalProp1: AdditionalProp[]
  additionalProp2: AdditionalProp[]
  additionalProp3: AdditionalProp[]
}

/** 單一商品採購統計明細 */
export interface AdditionalProp {
  /** 商品名稱 */
  productName: string
  /** 應購買數量（訂單總數） */
  shouldBuy: number
  /** 已購買數量 */
  purchased: number
  /** 尚未購買數量（shouldBuy - purchased） */
  remaining: number
}

/** 查詢採購清單的請求參數 */
export interface PurchaseListsParams {
  /** 活動 ID */
  eventId: number
}

/** 採購清單相關 API 集合 */
export const purchaseListApi = {
  /**
   * 依活動 ID 取得採購統計清單（依通路分組）
   * @param req - 包含活動 ID 的查詢參數
   * @returns 以通路名稱為 key 的採購統計物件
   */
  getPurchaseListsAll: async (req: PurchaseListsParams): Promise<PurchaseListRes> => {
    return await getApi('/orders/purchase-stats', req)
  },
}
