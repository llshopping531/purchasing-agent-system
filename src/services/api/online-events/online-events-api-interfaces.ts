/**
 *  查詢所有通販活動（分頁） request
 */
export interface QueryOnlineEventsReq {
  /** 活動關鍵字 */
  keyword?: string
  /** 第幾頁 */
  page?: number
  /** 一頁有幾筆資料 */
  size?: number
  /** 排序 */
  sort?: string
  /** 排序 (ASC / DESC) */
  direction?: 'ASC' | 'DESC'
}

/**
 *  查詢所有通販活動（分頁） response
 */
export interface QueryOnlineEventsRes {
  /** 通販活動內容 */
  content: QueryOnlineEventsContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢通販活動內容 */
export interface QueryOnlineEventsContent {
  /** 通販活動 ID */
  id: number
  /** 通販活動名稱 */
  name: string
  /** 開團日期 */
  startDate: string
  /** 進度 */
  progress: string
  /** 進度名稱 */
  progressName: string
  /** 官方出貨日期 */
  deliveryDate: string
  /** 備註 */
  note: string
  /** 是否鎖定活動 */
  isLocked: boolean
}
