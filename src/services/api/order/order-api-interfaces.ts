import type { ExtraData } from "../common-api-interface"

/**
 *  依活動 ID + 通路 ID 查詢訂單清單 request
 */
export interface OrderQueryReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 客戶關鍵字 */
  customerKeyword: string
  /** 第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 排序 */
  sort: string
  /** 排序 (ASC / DESC) */
  direction: 'ASC' | 'DESC'
}

/**
 *  依活動 ID + 通路 ID 查詢訂單清單 response
 */
export interface OrderQueryRes {
  /** 訂單內容 */
  content: OrderQueryContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢訂單內容 */
export type OrderQueryContent = OrderResBase

/** 新增訂單 request */
export type CreateOrderReq = OrderReqBase

/** 新增訂單 response */
export type CreateOrderRes = OrderResBase

/** 修改訂單 request */
export type ModifyOrderReq = OrderReqBase

/** 修改訂單 response */
export type ModifyOrderRes = OrderResBase

// 共用

/**
 *  訂單操作共用欄位 base
 */
export interface OrderReqBase {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 客戶 ID */
  customerId: number
  /** 商品 ID */
  productId: number
  /** 數量 */
  quantity: number
  /** 匯率 */
  exchangeRate?: number
  /** 小計 (JPY) */
  subtotalJpy?: number
  /** 小計 (TWD) */
  subtotalTwd?: number
  /** 訂單狀態 */
  orderStatus?: string
  /** 不計入贈品 */
  nonBonusTarget?: boolean
  /** 固定匯率 */
  isFixedRate?: boolean
  /** 不計入分潤 */
  nonCutTarget?: boolean
  /** 採購確認 */
  purchaseConfirm?: boolean
  /** 備註 */
  note?: string
  /** 自定義欄位 */
  extraData?: ExtraData
}

/**
 *  訂單資料共用欄位 base
 */
export interface OrderResBase {
  /** 訂單 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 客戶 ID */
  customerId: number
  /** 商品 ID */
  productId: number
  /** 數量 */
  quantity: number
  /** 匯率 */
  exchangeRate: number
  /** 小計 (JPY) */
  subtotalJpy: number
  /** 小計 (TWD) */
  subtotalTwd: number
  /** 訂單狀態 */
  orderStatus: string
  /** 不計入贈品 */
  nonBonusTarget: boolean
  /** 固定匯率 */
  isFixedRate: boolean
  /** 不計入分潤 */
  nonCutTarget: boolean
  /** 採購確認 */
  purchaseConfirm: boolean
  /** 備註 */
  note: string
  /** 自定義欄位 */
  extraData: string
  /** 商品名稱 */
  productName: string
  /** 台幣單價（日幣單價 × 匯率，進位至0/5） */
  unitTwd: number
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 客戶名稱 */
  customerName: string
  /** 採購者名稱 */
  purchaserName: string
  /** 通路名稱 */
  channelName: string
}
