/**
 * 通用下拉選項結構
 * 用於所有 SelectComponent 的選項清單
 */
export interface Option {
  /** 選項實際值（通常為 ID 字串） */
  value: string
  /** 選項顯示名稱 */
  name: string
}
