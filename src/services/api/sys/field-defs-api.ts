import { getApi } from '../base-api'

/** 查詢自定義欄位定義的請求參數 */
export interface QueryFieldDefsReq {
  /** 實體類型（例如 'ORDER'） */
  entityType: string
  /** 搜尋關鍵字 */
  keyword?: string
  /** 第幾頁 */
  page?: number
  /** 每頁筆數 */
  size?: number
  /** 排序欄位 */
  sort?: string
  /** 排序方向 */
  direction?: string
}

/** 查詢自定義欄位定義的回應 */
export interface QueryFieldDefsRes {
  /** 欄位定義清單 */
  content: QueryFieldDefContent[]
  /** 當前頁碼 */
  page: number
  /** 每頁筆數 */
  size: number
  /** 總筆數 */
  totalElements: number
  /** 總頁數 */
  totalPages: number
}

/** 單一自定義欄位定義內容 */
export interface QueryFieldDefContent {
  /** 欄位定義 ID */
  id: number
  /** 對應的實體類型 */
  entityType: string
  /** 欄位 key（對應資料中的屬性名稱） */
  fieldKey: string
  /** 欄位顯示標籤 */
  fieldLabel: string
  /** 欄位型別 */
  fieldType: string
  /** 下拉選項（無則為 null） */
  options: null
  /** 是否為必填欄位 */
  isRequired: boolean
  /** 排序順序 */
  sort: number
  /** 是否啟用 */
  isActive: boolean
  /** 是否在前台顯示 */
  isFrontendVisible: boolean
}

/** 系統自定義欄位定義 API 集合 */
export const fieldDefsApi = {
  /**
   * 依實體類型查詢自定義欄位定義清單
   * @param data - 包含 entityType 等篩選條件的查詢參數
   * @returns 分頁後的欄位定義清單
   */
  getfieldDefs: async (data: QueryFieldDefsReq): Promise<QueryFieldDefsRes> => {
    return await getApi('/sys/field-defs', data)
  },
}
