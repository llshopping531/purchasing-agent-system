import type { ExtraData } from '../common-api-interface'

/**
 *  查詢所有客戶（分頁） request
 */
export interface QueryCustomersReq {
  /** 客戶關鍵字 */
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
 *  查詢所有客戶（分頁） response
 */
export interface QueryCustomersRes {
  /** 客戶內容 */
  content: QueryCustomersContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢客戶內容 */
export type QueryCustomersContent = CustomersResBase

/** 查詢所有客戶（不分頁） response */
export type QueryCustomersAllRes = CustomersResBase

/** 新增客戶 request */
export type CreateCustomersReq = CustomersReqBase

/** 新增客戶 response */
export type CreateCustomersRes = CustomersResBase

/** 修改客戶 request */
export type ModifyCustomersReq = CustomersReqBase

/** 修改客戶 response */
export type ModifyCustomersRes = CustomersResBase

// 共用

/**
 *  客戶操作共用欄位 base
 */
export interface CustomersReqBase {
  /** 客戶名稱 */
  name: string
  /** 來源 */
  source: string
  /** 是否已私訊官方帳號 */
  hasMessagedOfficial: boolean
  /** 是否享有折扣 */
  isDiscount: boolean
  /** 是否為老闆 */
  isBoss: boolean
  /** 備註 */
  note: string
  /** 自定義欄位 */
  extraData?: ExtraData
}

/**
 *  客戶資料共用欄位 base
 */
export interface CustomersResBase {
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
