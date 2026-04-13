/**
 * 通用下拉選項結構
 * 用於所有 SelectComponent 的選項清單
 * T 為 value 的實際型別，預設為 string（向下相容）
 */
export interface SelectOption<T> {
  /** 選項實際值（可為任意型別，例如完整的 API 回應物件） */
  value: T
  /** 選項顯示名稱 */
  name: string
}
