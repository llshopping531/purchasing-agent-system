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
export type QueryOnlineEventsContent = OnlineEventsResBase

/** 查詢單一通販活動 response */
export type GetOnlineEventByIdRes = OnlineEventsResBase

/** 新增通販活動 request */
export type CreateOnlineEventsReq = OnlineEventsReqBase

/** 新增通販活動 response */
export type CreateOnlineEventsRes = OnlineEventsResBase

/** 修改通販活動 request */
export type ModifyOnlineEventsReq = OnlineEventsReqBase

/** 修改通販活動 response */
export type ModifyOnlineEventsRes = OnlineEventsResBase

// 共用

/**
 *  通販活動操作共用欄位 base
 */
export interface OnlineEventsReqBase {
  /** 通販活動名稱 */
  name: string
  /** 開團日期 */
  startDate: string
  /** 進度 */
  progress?: string
  /** 官方出貨日期 */
  deliveryDate?: string
  /** 備註 */
  note?: string
  /** 是否鎖定活動 */
  isLocked?: boolean
}

/** 查詢所有通販活動（不分頁） response */
export type GetAllOnlineEventsRes = OnlineEventsResBase[]

/**
 *  通販活動資料共用欄位 base
 */
export interface OnlineEventsResBase {
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
