import type { ExtraData } from '../common-api-interface'

/**
 * 依活動 ID 查詢通路清單（分頁）request
 */
export interface QueryChannelsReq {
  /** 活動 ID */
  eventId: number
  /** 第幾頁 */
  page?: number
  /** 一頁有幾筆資料 */
  size?: number
  /** 排序欄位 */
  sort?: string
  /** 排序 (ASC / DESC) */
  direction?: 'ASC' | 'DESC'
  /** 關鍵字 */
  keyword?: string
}

/**
 * 依活動 ID 查詢通路清單（分頁）response
 */
export interface QueryChannelsRes {
  /** 通路內容 */
  content: QueryChannelsContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢通路內容 */
export type QueryChannelsContent = ChannelResBase

/**
 * 依活動 ID 查詢通路清單（不分頁）request
 */
export interface QueryChannelsAllReq {
  /** 活動 ID */
  eventId: number
}

/** 查詢通路清單（不分頁）response */
export type QueryChannelsAllRes = ChannelResBase

/** 新增通路 request */
export type CreateChannelReq = ChannelReqBase

/** 新增通路 response */
export type CreateChannelRes = ChannelResBase

/** 修改通路 request */
export type ModifyChannelReq = ChannelReqBase

/** 修改通路 response */
export type ModifyChannelRes = ChannelResBase

// 共用

/**
 * 通路操作共用欄位 base
 */
export interface ChannelReqBase {
  /** 所屬活動 ID */
  eventId: number
  /** 通路名稱 */
  name: string
  /** 匯率 */
  exchangeRate: number
  /** 日幣免稅門檻 */
  thresholdJpy: number
  /** 自定義欄位 */
  extraData?: ExtraData
}

/**
 * 通路資料共用欄位 base
 */
export interface ChannelResBase {
  /** 通路 ID */
  id: number
  /** 所屬活動 ID */
  eventId: number
  /** 通路名稱 */
  name: string
  /** 匯率 */
  exchangeRate: number
  /** 日幣免稅門檻 */
  thresholdJpy: number
  /** 自定義欄位（物件格式） */
  extraData: ExtraData
  /** 自定義欄位（JSON 字串格式） */
  extraDataJson: string
}
