import type { ExtraData } from '../common-api-interface'

/**
 * 查詢活動內有訂單的客戶清單 request
 */
export interface GetCustomerOrdersCustomersReq {
  /** 活動 ID */
  eventId: number
}

/**
 * 活動內有訂單的客戶資料
 */
export interface CustomerOrdersCustomer {
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
  /** 備註 */
  note: string
  /** 自定義欄位 */
  extraData: ExtraData
  /** 自定義欄位 (JSON 字串) */
  extraDataJson: string
}

/** 查詢活動內有訂單的客戶清單 response */
export type GetCustomerOrdersCustomersRes = CustomerOrdersCustomer[]

/**
 * 查詢客戶在活動內的個人訂單清單 request
 */
export interface GetCustomerOrdersReq {
  /** 客戶 ID */
  customerId: number
  /** 活動 ID */
  eventId: number
}

/**
 * 客戶個人訂單資料
 */
export interface CustomerOrder {
  /** 訂單 ID */
  id: number
  /** 通路 ID */
  channelId: number
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 通路名稱 */
  channelName: string
  /** 數量 */
  quantity: number
  /** 小計 (JPY) */
  subtotalJpy: number
  /** 小計 (TWD) */
  subtotalTwd: number
  /** 匯率 */
  exchangeRate: number
  /** 台幣單價 */
  unitTwd: number
  /** 訂單狀態值 */
  orderStatus: string
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 自定義欄位 (JSON 字串) */
  extraData: string
}

/** 查詢客戶在活動內的個人訂單清單 response */
export type GetCustomerOrdersRes = CustomerOrder[]

/**
 * 查詢客戶在活動內各通路滿額狀態 request
 */
export interface GetChannelBonusReq {
  /** 客戶 ID */
  customerId: number
  /** 活動 ID */
  eventId: number
}

/**
 * 通路滿額狀態資料
 */
export interface ChannelBonus {
  /** 通路名稱 */
  channelName: string
  /** 該通路累計日幣金額 */
  totalJpy: number
  /** 滿額門檻（日幣） */
  thresholdJpy: number
  /** 已達滿額次數 */
  bonusCount: number
}

/** 查詢客戶在活動內各通路滿額狀態 response */
export type GetChannelBonusRes = ChannelBonus[]
