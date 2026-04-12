/**
 * 查詢訂單總覽 request
 */
export interface QueryStatsOverviewReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID（可選，不指定時查詢全通路） */
  channelId?: number
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
  /** 匯率 */
  exchangeRate: number
  /** 日幣小計 */
  subtotalJpy: number
  /** 台幣小計 */
  subtotalTwd: number
  /** 訂單狀態名稱 */
  orderStatusName: string
  /** 是否為盲抽 */
  isBlindBox: boolean
  /** 採購確認 */
  purchaseConfirm: boolean
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
