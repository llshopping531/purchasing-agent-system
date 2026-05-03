/** 查詢系統選單 request */
export interface QueryMenusReq {
  /** 搜尋關鍵字（可選） */
  keyword?: string
  /** 頁數（起從 0），預設為 0 */
  page?: number
  /** 每頁筆數，預設為 20 */
  size?: number
  /** 排序欄位名稱（可選） */
  sort?: string
  /** 排序方向，預設為 ASC */
  direction?: 'ASC' | 'DESC'
}

/** 單一系統選單項目 */
export interface MenusContent {
  /** 選單 ID */
  id: number
  /** 選單代碼（例如 'ORDER_STATUS'） */
  code: string
  /** 選單名稱（例如 '訂單狀態'） */
  name: string
  /** 選項值 */
  menuValue: string
  /** 選項顯示名稱 */
  menuName: string
  /** 排序順序 */
  sort: number
  /** 建立者 */
  createBy: string
}

/** 查詢系統選單 response */
export interface QueryMenusRes {
  /** 選單項目清單 */
  content: MenusContent[]
  /** 當前頁碼 */
  page: number
  /** 每頁筆數 */
  size: number
  /** 總筆數 */
  totalElements: number
  /** 總頁數 */
  totalPages: number
}
