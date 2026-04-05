import type { ExtraData } from '../common-api-interface'

/**
 *  依活動 ID + 通路 ID 查詢商品清單（分頁） request
 */
export interface QueryProductsReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 客戶關鍵字 */
  customerKeyword?: string
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
 *  依活動 ID + 通路 ID 查詢商品清單（分頁） response
 */
export interface QueryProductsRes {
  /** 商品內容 */
  content: QueryProductsContent[]
  /** 當前第幾頁 */
  page: number
  /** 一頁有幾筆資料 */
  size: number
  /** 總共有幾筆資料 */
  totalElements: number
  /** 總共有幾頁 */
  totalPages: number
}

/** 查詢商品內容 */
export type QueryProductsContent = ProductsResBase

/** 新增商品 request */
export type CreateProductsReq = ProductsReqBase

/** 新增商品 response */
export type CreateProductsRes = ProductsResBase

/** 修改商品 params */
export interface ModifyProductsParams {
  id: number
}

/** 修改商品 request */
export type ModifyProductsReq = ProductsReqBase

/** 修改商品 response */
export type ModifyProductsRes = ProductsResBase

/** 刪除商品 params */
export interface DeleteProductsParams {
  id: number
}

/**
 *  依活動 ID + 通路 ID 查詢商品清單（不分頁） request
 */
export interface QueryProductsAllReq {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
}

/** 查詢商品清單（不分頁） response */
export type QueryProductsAllRes = ProductsResBase

// 共用

/**
 *  商品操作共用欄位 base
 */
export interface ProductsReqBase {
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 商品名稱 */
  name: string
  /** 日幣定價 */
  priceJpy: number
  /** 匯率 */
  exchangeRate: number
  /** 台幣定價 */
  priceTwd: number
  /** 商品圖片 */
  image: string
  /** 自定義欄位 */
  extraData?: ExtraData
}

/**
 *  商品資料共用欄位 base
 */
export interface ProductsResBase {
  /** 商品 ID */
  id: number
  /** 活動 ID */
  eventId: number
  /** 通路 ID */
  channelId: number
  /** 商品名稱 */
  name: string
  /** 日幣定價 */
  priceJpy: number
  /** 匯率 */
  exchangeRate: number
  /** 台幣定價 */
  priceTwd: number
  /** 商品圖片 */
  image: string
  /** 自定義欄位 */
  extraData: ExtraData
  /** 自定義欄位 (JSON 字串) */
  extraDataJson: string
}
