/**
 *  依活動 ID 查詢通販訂單清單（分頁） request
 */
export interface QueryOnlineOrdersReq {
  /** 活動 ID */
  eventId?: number
  /** 客戶關鍵字 */
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
 *  依活動 ID 查詢通販訂單清單（分頁） response
 */
export interface QueryOnlineOrdersRes {
  /** 訂單內容 */
  content: QueryOnlineOrdersContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢通販訂單內容 */
export type QueryOnlineOrdersContent = OnlineOrdersResBase

/** 查詢單一通販訂單 response */
export type GetOnlineOrderByIdRes = OnlineOrdersResBase

/** 新增通販訂單 request */
export type CreateOnlineOrdersReq = OnlineOrdersReqBase

/** 新增通販訂單 response */
export type CreateOnlineOrdersRes = OnlineOrdersResBase

/** 修改通販訂單 request */
export type ModifyOnlineOrdersReq = OnlineOrdersReqBase

/** 修改通販訂單 response */
export type ModifyOnlineOrdersRes = OnlineOrdersResBase

// 共用

/**
 *  通販訂單操作共用欄位 base
 */
export interface OnlineOrdersReqBase {
  /** 活動 ID */
  eventId: number
  /** 客戶 ID */
  customerId: number
  /** 商品 ID */
  productId: number
  /** 官方訂單 ID */
  officialOrderId?: number
  /** 數量 */
  quantity: number
  /** 日本境內運費 */
  domesticShipping?: number
  /** 國際運費 */
  internationalShipping?: number
  /** 備註 */
  note?: string
}

/**
 *  通販訂單資料共用欄位 base
 */
export interface OnlineOrdersResBase {
  /** 訂單 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 客戶 ID */
  customerId: number
  /** 客戶名稱 */
  customerName: string
  /** 商品 ID */
  productId: number
  /** 商品名稱 */
  productName: string
  /** 商品重量 (克) */
  productWeight: number
  /** 官方訂單 ID */
  officialOrderId: number
  /** 官方訂單名稱 */
  officialOrderName: string
  /** 數量 */
  quantity: number
  /** 小計 (TWD) */
  subtotalTwd: number
  /** 日本境內運費 */
  domesticShipping: number
  /** 國際運費 */
  internationalShipping: number
  /** 備註 */
  note: string
  /** 建立者 */
  createBy: string
  /** 建立時間 */
  createTime: string
  /** 更新者 */
  updateBy: string
  /** 更新時間 */
  updateTime: string
}
