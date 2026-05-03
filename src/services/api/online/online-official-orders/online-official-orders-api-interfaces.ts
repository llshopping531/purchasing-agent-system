/**
 *  查詢所有官方訂單（分頁） request
 */
export interface QueryOnlineOfficialOrdersReq {
  /** 活動 ID */
  eventId?: number
  /** 訂單名稱關鍵字 */
  keyword?: string
  /** 第幾頁 */
  page?: number
  /** 一頁有幾筆資料 */
  size?: number
  /** 排序欄位 */
  sort?: string
  /** 排序 (ASC / DESC) */
  direction?: 'ASC' | 'DESC'
}

/**
 *  查詢所有官方訂單（分頁） response
 */
export interface QueryOnlineOfficialOrdersRes {
  /** 官方訂單內容 */
  content: QueryOnlineOfficialOrdersContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢官方訂單內容 */
export type QueryOnlineOfficialOrdersContent = OnlineOfficialOrdersResBase

/** 查詢特定活動所有官方訂單 response */
export type GetOnlineOfficialOrdersByEventRes = OnlineOfficialOrdersResBase[]

/** 查詢單一官方訂單 response */
export type GetOnlineOfficialOrderByIdRes = OnlineOfficialOrdersResBase

/** 新增官方訂單 request */
export type CreateOnlineOfficialOrdersReq = OnlineOfficialOrdersReqBase

/** 新增官方訂單 response */
export type CreateOnlineOfficialOrdersRes = OnlineOfficialOrdersResBase

/** 修改官方訂單 request */
export type ModifyOnlineOfficialOrdersReq = OnlineOfficialOrdersReqBase

/** 修改官方訂單 response */
export type ModifyOnlineOfficialOrdersRes = OnlineOfficialOrdersResBase

// 共用

/**
 *  官方訂單操作共用欄位 base
 */
export interface OnlineOfficialOrdersReqBase {
  /** 活動 ID */
  eventId: number
  /** 訂單名稱 */
  name: string
  /** 備註 */
  note?: string
  /** 日本境內運費（總額） */
  domesticShippingTotal?: number
  /** 國際運費（總額） */
  internationalShippingTotal?: number
}

/**
 *  官方訂單資料共用欄位 base
 */
export interface OnlineOfficialOrdersResBase {
  /** 訂單 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 活動名稱 */
  eventName: string
  /** 訂單名稱 */
  name: string
  /** 備註 */
  note: string
  /** 日本境內運費（總額） */
  domesticShippingTotal: number
  /** 國際運費（總額） */
  internationalShippingTotal: number
  /** 建立者 */
  createBy: string
  /** 建立時間 */
  createTime: string
  /** 更新者 */
  updateBy: string
  /** 更新時間 */
  updateTime: string
}
