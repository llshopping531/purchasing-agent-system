/**
 * 客戶查詢連結的訂單（充實後）資料
 */
export interface OrderDraw {
  id: number
  orderId: number
  result: string
  note: string
}

export interface QueryOrderEnriched {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 通路名稱 */
  channelName: string
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 數量 */
  quantity: number
  /** 日幣單價 */
  priceJpy: number
  /** 台幣小計 */
  subtotalTwd: number
  /** 匯率 */
  exchangeRate: number
  /** 台幣單價 */
  unitTwd: number
  /** 訂單狀態值 */
  orderStatus: string
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 盲抽結果 */
  orderDraws: OrderDraw[]
}

/** 查詢客戶充實後訂單列表 response */
export type GetQueryOrdersEnrichedRes = QueryOrderEnriched[]

/** 透過 queryUuid 查詢客戶基本資料 response */
export interface GetQueryCustomerRes {
  id: number
  name: string
  source: string
  hasMessagedOfficial: boolean
  isDiscount: boolean
  isBoss: boolean
  isBlacklist: boolean
  queryUuid: string
  note: string
  extraData: string
}
