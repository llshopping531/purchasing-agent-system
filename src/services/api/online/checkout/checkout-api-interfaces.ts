/** 結帳單收款狀態 */
export type CheckoutBillStatus = '未收款' | '收款中' | '已收款'

/** 結帳單品項 */
export interface CheckoutRowItem {
  /** 商品名稱 */
  name: string
  /** 數量 */
  quantity: number
  /** 單價（TWD） */
  unitPrice: number
  /** 小計（TWD） */
  itemTotal: number
  /** 來源通販訂單 ID（online_orders.id） */
  orderId?: number
}

/** 結帳單依通路分組的品項 */
export interface CheckoutRowEvent {
  /** 通路名稱 */
  eventName: string
  /** 品項清單 */
  items: CheckoutRowItem[]
}

/** 結帳單顧客明細列 */
export interface CheckoutRowRes {
  /** 結帳單明細列 ID（僅內部查詢時提供，公開頁面不提供） */
  id?: number
  /** 顧客名稱 */
  customerName: string
  /** 依通路分組的品項 */
  eventList: CheckoutRowEvent[]
  /** 格式化合計字串 */
  total: string
  /** 商品未付金額 */
  remainingAmount: number
  /** 是否已匯款 */
  remitted: boolean
  /** 是否已對帳 */
  reconciled: boolean
  /** 備註 */
  note: string
}

/** 結帳單回應 */
export interface CheckoutBillRes {
  /** 結帳單 ID */
  id: number
  /** 結帳單名稱 */
  name: string
  /** 截止日（yyyy-MM-dd） */
  deadline: string
  /** 收款狀態 */
  status: CheckoutBillStatus
  /** 關聯的活動 ID 列表 */
  eventIds: number[]
  /** 對應活動名稱（顯示用） */
  eventNames: string[]
  /** 所有顧客合計（TWD） */
  total: number
  /** 建立時間 */
  createdAt: string
  /** 公開查詢 UUID（用於對外分享的結帳單頁面） */
  queryUuid: string
  /** 各顧客結帳資料列（僅單筆查詢／建立時提供） */
  rows?: CheckoutRowRes[]
}

/** 公開結帳單查詢 response（對外分享頁面用，不含內部欄位） */
export interface PublicCheckoutBillRes {
  /** 結帳單名稱 */
  name: string
  /** 截止日（yyyy-MM-dd） */
  deadline: string
  /** 收款狀態 */
  status: CheckoutBillStatus
  /** 對應活動名稱（顯示用） */
  eventNames: string[]
  /** 所有顧客合計（TWD） */
  total: number
  /** 各顧客結帳資料列 */
  rows: CheckoutRowRes[]
}

/**
 *  取得結帳單列表 request
 */
export interface QueryCheckoutBillsReq {
  /** 篩選收款狀態（可選） */
  status?: CheckoutBillStatus
}

/** 取得結帳單列表 response（無分頁，回傳全部） */
export type QueryCheckoutBillsRes = CheckoutBillRes[]

/** 取得單一結帳單（含所有 rows） response */
export type GetCheckoutBillByIdRes = CheckoutBillRes

/** 建立結帳單 request */
export interface CreateCheckoutBillReq {
  /** 結帳單名稱 */
  name: string
  /** 截止日（yyyy-MM-dd） */
  deadline: string
  /** 關聯的活動 ID 列表 */
  eventIds: number[]
}

/** 建立結帳單 response（含依活動即時彙整出的 rows） */
export type CreateCheckoutBillRes = CheckoutBillRes

/** 更新結帳單基本資料 request（欄位皆為可選） */
export interface UpdateCheckoutBillReq {
  /** 結帳單名稱 */
  name?: string
  /** 截止日（yyyy-MM-dd） */
  deadline?: string
  /** 收款狀態 */
  status?: CheckoutBillStatus
}

/** 更新結帳單基本資料 response */
export type UpdateCheckoutBillRes = CheckoutBillRes

/** 刪除結帳單 response */
export interface DeleteCheckoutBillRes {
  success: boolean
}

/** 儲存結帳單對帳資料 request（一筆 = 一位顧客） */
export interface SaveCheckoutRowReq {
  /** 顧客名稱 */
  customerName: string
  /** 剩餘金額 */
  remainingAmount: number
  /** 是否已匯款 */
  remitted: boolean
  /** 是否已對帳 */
  reconciled: boolean
  /** 備註 */
  note: string
}

/** 儲存結帳單對帳資料 request body */
export interface SaveCheckoutBillReq {
  rows: SaveCheckoutRowReq[]
}

/** 儲存結帳單對帳資料 response */
export interface SaveCheckoutBillRes {
  success: boolean
}
