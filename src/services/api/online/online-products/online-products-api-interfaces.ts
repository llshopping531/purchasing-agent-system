/**
 *  查詢所有通販商品（分頁） request
 */
export interface QueryOnlineProductsReq {
  /** 活動 ID */
  eventId?: number
  /** 商品名稱關鍵字 */
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
 *  查詢所有通販商品（分頁） response
 */
export interface QueryOnlineProductsRes {
  /** 商品內容 */
  content: QueryOnlineProductsContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢通販商品內容 */
export type QueryOnlineProductsContent = OnlineProductsResBase

/** 查詢單一通販商品 response */
export type GetOnlineProductByIdRes = OnlineProductsResBase

/** 新增通販商品 request */
export type CreateOnlineProductsReq = OnlineProductsReqBase

/** 新增通販商品 response */
export type CreateOnlineProductsRes = OnlineProductsResBase

/** 修改通販商品 request */
export type ModifyOnlineProductsReq = OnlineProductsReqBase

/** 修改通販商品 response */
export type ModifyOnlineProductsRes = OnlineProductsResBase

// 共用

/**
 *  通販商品操作共用欄位 base
 */
export interface OnlineProductsReqBase {
  /** 活動 ID */
  eventId: number
  /** 商品名稱 */
  name: string
  /** 台幣價格 */
  priceTwd?: number
  /** 重量（公斤） */
  weight?: number
}

/**
 *  通販商品資料共用欄位 base
 */
export interface OnlineProductsResBase {
  /** 商品 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 商品名稱 */
  name: string
  /** 台幣價格 */
  priceTwd: number
  /** 重量（公斤） */
  weight: number
}
