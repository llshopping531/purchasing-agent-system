/**
 * 採購清單回應結構
 * key 為通路名稱，value 為該通路的採購明細陣列
 */
export interface PurchaseListAllRes {
  [key: string]: PurchaseListData[]
}

/** 單一商品採購統計資料 */
export interface PurchaseListData {
  /** 通路 ID */
  channelId: number
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 應購買數量（訂單總數） */
  shouldBuy: number
  /** 已購買數量 */
  purchased: number
  /** 尚未購買數量（shouldBuy - purchased） */
  remaining: number
  /** 是否為盲抽 */
  isBlindBox: true
  /** 盲抽已拆數量 */
  blindBoxDrawn: number
  /** 盲抽未拆數量 */
  blindBoxNotDrawn: number
}

/**
 * 查詢採購統計明細（單一通路+商品的喊單/已購清單）request
 */
export interface QueryPurchaseDetailReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 商品 ID */
  productId: number
}

/** 查詢採購統計明細回應 */
export type QueryPurchaseDetailRes = PurchaseDetail[]

/** 單筆採購明細 */
export interface PurchaseDetail {
  /** 採購明細 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 客戶 ID */
  customerId: number
  /** 商品 ID */
  productId: number
  /** 購買數量 */
  quantity: number
  /** 匯率 */
  exchangeRate: number
  /** 小計（日幣） */
  subtotalJpy: number
  /** 小計（台幣） */
  subtotalTwd: number
  /** 訂單狀態代碼 */
  orderStatus: string
  /** 是否非紅利對象 */
  nonBonusTarget: boolean
  /** 是否使用固定匯率 */
  isFixedRate: boolean
  /** 是否非砍單對象 */
  nonCutTarget: boolean
  /** 是否已確認採購 */
  purchaseConfirm: boolean
  /** 備註 */
  note: string
  /** 額外資料 */
  extraData: string
  /** 商品名稱 */
  productName: string
  /** 單價（台幣） */
  unitTwd: number
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 客戶名稱 */
  customerName: string
  /** 採購人員名稱 */
  purchaserName: string
  /** 通路名稱 */
  channelName: string
}

/** 處理採購 request */
export interface PurchaseCheckReq {
  productId: number
  purchaseQty: number
}
