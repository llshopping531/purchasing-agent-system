import type { ExtraData } from '../../common-api-interface'

/**
 * 查詢通販活動內有訂單的客戶清單 request
 */
export interface GetOnlinePackingCustomersReq {
  /** 通販活動 ID 列表 */
  eventIds: number[]
}

/**
 * 通販活動內有訂單的客戶資料
 */
export interface OnlinePackingCustomer {
  /** 客戶 ID */
  id: number
  /** 客戶名稱 */
  name: string
  /** 來源 */
  source: string
  /** 來源名稱 */
  sourceName: string
  /** 是否已私訊官方帳號 */
  hasMessagedOfficial: boolean
  /** 是否享有折扣 */
  isDiscount: boolean
  /** 是否為老闆 */
  isBoss: boolean
  /** 是否為黑名單 */
  isBlacklist: boolean
  /** 是否排除分潤 */
  excludeProfit: boolean
  /** 備註 */
  note: string
  /** 自定義欄位 */
  extraData: ExtraData
  /** 自定義欄位 (JSON 字串) */
  extraDataJson: string
}

/** 查詢通販活動內有訂單的客戶清單 response */
export type GetOnlinePackingCustomersRes = OnlinePackingCustomer[]

/**
 * 查詢通販包貨清單 request
 */
export interface GetOnlinePackingOrdersReq {
  /** 客戶 ID */
  customerId: number
  /** 通販活動 ID 列表 */
  eventIds: number[]
}

/**
 * 通販包貨訂單資料
 */
export interface OnlinePackingOrder {
  /** 訂單 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 客戶 ID */
  customerId: number
  /** 客戶名稱 */
  customerName: string
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 商品重量 */
  productWeight: number
  /** 官方訂單 ID */
  officialOrderId: number
  /** 官方訂單名稱 */
  officialOrderName: string
  /** 數量 */
  quantity: number
  /** 台幣小計 */
  subtotalTwd: number
  /** 國內運費 */
  domesticShipping: number
  /** 國際運費 */
  internationalShipping: number
  /** 備註 */
  note: string
  /** 建立者 */
  createBy: string
  /** 建立時間 */
  createTime: string
  /** 更新者 */
  updateBy: string
  /** 更新時間 */
  updateTime: string
}

/** 查詢通販包貨清單 response */
export type GetOnlinePackingOrdersRes = OnlinePackingOrder[]
