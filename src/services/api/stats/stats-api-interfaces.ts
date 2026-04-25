import type { ExtraData } from '../common-api-interface'

/**
 * 查詢訂單總覽 request
 */
export interface QueryStatsOverviewReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID（可選，不指定時查詢全通路） */
  channelId?: number
  /** 訂單狀態（可選，多選用逗號分隔，'1'=已喊單 '2'=已購買 '3'=已取消 '4'=缺貨） */
  orderStatus?: string
  /** 顧客 ID（可選） */
  customerId?: number
  /** 商品 ID（可選） */
  productId?: number
  /** 第幾頁 */
  page?: number
  /** 一頁有幾筆資料 */
  size?: number
  /** 排序欄位 */
  sort?: string
  /** 排序方向 */
  direction?: string
}

/**
 * 查詢訂單總覽 response
 */
export interface QueryStatsOverviewRes {
  content: StatsOverviewItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** 訂單總覽單筆資料 */
export interface StatsOverviewItem {
  /** 訂單 ID */
  id: number
  eventId: string
  channelId: string
  /** 通路名稱 */
  channelName: string
  /** 顧客 ID */
  customerId: string
  /** 顧客名稱 */
  customerName: string
  /** 商品 ID */
  productId: string
  /** 商品名稱 */
  productName: string
  /** 數量 */
  quantity: number
  /** 匯率 */
  exchangeRate: number
  /** 日幣小計 */
  subtotalJpy: number
  /** 台幣小計 */
  subtotalTwd: number
  /** 顯示用日幣（缺貨時為 0） */
  displaySubtotalJpy: number
  /** 顯示用台幣（缺貨時為 0）） */
  displaySubtotalTwd: number
  /** 訂單狀態 */
  orderStatus: string
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 不計入贈品 */
  nonBonusTarget: boolean
  /** 固定匯率 */
  isFixedRate: boolean
  /** 不計入分潤 */
  nonCutTarget: boolean
  /** 備註 */
  note: string
  /** 自定義欄位 */
  extraData: ExtraData
}

/**
 * 查詢活動訂單金額總計 request
 */
export interface QueryStatsTotalsReq {
  /** 活動 ID */
  eventId: number
}

/**
 * 查詢活動訂單金額總計 response
 */
export interface QueryStatsTotalsRes {
  /** 日幣總計 */
  totalJpy: number
  /** 台幣總計 */
  totalTwd: number
}

/**
 * 查詢通路訂單金額總計 request
 */
export interface QueryStatsChannelTotalsReq {
  /** 通路 ID */
  channelId: number
}

/**
 * 查詢通路訂單金額總計 response
 */
export interface QueryStatsChannelTotalsRes {
  /** 日幣總計 */
  totalJpy: number
  /** 台幣總計 */
  totalTwd: number
}

/**
 * 查詢通路滿額需求統計 request
 */
export interface QueryBonusRequirementStatsReq {
  /** 活動 ID */
  eventId: string
  /** 通路 ID */
  channelId: string
}

/**
 * 查詢通路滿額需求統計 response
 */
export interface QueryBonusRequirementStatsRes {
  /** 通路 ID */
  channelId: number
  /** 通路名稱 */
  channelName: string
  /** 滿額需求金額（日幣） */
  bonusRequirement: number
}

/**
 * 查詢顧客消費排行 request
 */
export interface QueryCustomerRankingReq {
  /** 活動 ID */
  eventId: number
  /** 排序欄位 */
  sort?: string
  /** 排序方向 */
  direction?: 'ASC' | 'DESC'
}

/** 顧客消費排行單筆資料 */
export interface CustomerRankingItem {
  /** 顧客 ID */
  customerId: number
  /** 顧客名稱 */
  customerName: string
  /** 總數量 */
  totalQuantity: number
  /** 台幣總計 */
  totalTwd: number
}

/** 查詢顧客消費排行 response */
export type QueryCustomerRankingRes = CustomerRankingItem[]

/**
 * 查詢分潤總計 request
 */
export interface QueryStatsProfitShareSummaryReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID（可選） */
  channelId?: number
}

/**
 * 查詢分潤總計 response
 */
export interface QueryStatsProfitShareSummaryRes {
  /** 台幣總額 */
  totalTwd: number
  /** 獲利金額 */
  totalProfit: number
  /** 分潤金額 */
  totalProfitShare: number
  /** 分潤比例 */
  ratio: number
  /** 成本匯率 */
  costRate: number
}

/**
 * 查詢分潤明細 request
 */
export interface QueryStatsProfitShareReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID（可選） */
  channelId?: number
  /** 第幾頁 */
  page?: number
  /** 一頁有幾筆資料 */
  size?: number
  /** 排序欄位 */
  sort?: string
  /** 排序方向 */
  direction?: 'ASC' | 'DESC'
}

/**
 * 查詢分潤明細 response
 */
export interface QueryStatsProfitShareRes {
  content: ProfitShareItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/** 分潤明細單筆資料 */
export interface ProfitShareItem {
  /** 訂單 ID */
  id: number
  /** 顧客名稱 */
  customerName: string
  /** 採購者名稱 */
  purchaserName: string
  /** 通路名稱 */
  channelName: string
  /** 商品名稱 */
  productName: string
  /** 數量 */
  quantity: number
  /** 台幣小計 */
  subtotalTwd: number
  /** 獲利金額 */
  profit: number
  /** 分潤金額 */
  profitShare: number
  /** 訂單狀態名稱 */
  orderStatusName: string
}
