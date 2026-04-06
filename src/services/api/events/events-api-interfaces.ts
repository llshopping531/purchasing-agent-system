import type { ExtraData } from '../common-api-interface'

/**
 *  查詢所有活動（分頁） request
 */
export interface QueryEventsReq {
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
 *  查詢所有活動（分頁） response
 */
export interface QueryEventsRes {
  /** 活動內容 */
  content: QueryEventsContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢活動內容 */
export type QueryEventsContent = EventsResBase

/** 查詢所有活動（不分頁） response */
export type QueryEventsAllRes = EventsResBase

/** 新增活動 request */
export type CreateEventsReq = EventsReqBase

/** 新增活動 response */
export type CreateEventsRes = EventsResBase

/** 修改活動 request */
export type ModifyEventsReq = EventsReqBase

/** 修改活動 response */
export type ModifyEventsRes = EventsResBase

// 共用

/**
 *  活動操作共用欄位 base
 */
export interface EventsReqBase {
  /** 活動名稱 */
  name: string
  /** 活動開始日期 */
  startDate: string
  /** 活動結束日期 */
  endDate: string
  /** 是否隱藏 */
  isHidden: boolean
  /** 是否鎖定 */
  isLocked: boolean
  /** 自定義欄位 */
  extraData?: ExtraData
}

/**
 *  活動資料共用欄位 base
 */
export interface EventsResBase {
  /** 活動 ID */
  id: number
  /** 活動名稱 */
  name: string
  /** 活動開始日期 */
  startDate: string
  /** 活動結束日期 */
  endDate: string
  /** 是否隱藏 */
  isHidden: boolean
  /** 是否鎖定 */
  isLocked: boolean
  /** 自定義欄位（物件格式） */
  extraData: ExtraData
  /** 自定義欄位（JSON 字串格式） */
  extraDataJson: string
}
