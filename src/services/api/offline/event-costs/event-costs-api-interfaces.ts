/**
 * 活動成本 API 相關 interface
 */

/** 查詢活動成本 request */
export interface QueryEventCostsReq {
  /** 活動 ID */
  eventId: number | string
}

/** 查詢活動成本總計 request */
export interface QueryEventCostsTotalReq {
  /** 活動 ID */
  eventId: number | string
}

/** 新增活動成本 request */
export interface CreateEventCostReq {
  /** 活動 ID */
  eventId: number
  /** 採購者 ID */
  purchaser: string
  /** 費用項目 */
  item: string
  /** 金額 */
  fee: number
}

/** 修改活動成本 request */
export interface ModifyEventCostReq {
  /** 活動 ID */
  eventId: number
  /** 採購者 ID */
  purchaser: string
  /** 費用項目 */
  item: string
  /** 金額 */
  fee: number
}

/** 活動成本資料共用欄位 base */
export interface EventCostResBase {
  /** 成本 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 採購者 ID */
  purchaser: string
  /** 採購者名稱 */
  purchaserName: string
  /** 費用項目 */
  item: string
  /** 金額 */
  fee: number
  /** 建立者 */
  createBy: string
  /** 建立時間 */
  createTime: string
  /** 更新者 */
  updateBy: string
  /** 更新時間 */
  updateTime: string
}

/** 查詢活動成本 response item */
export type QueryEventCostItem = EventCostResBase
