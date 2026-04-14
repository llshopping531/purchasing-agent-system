import { getApi, postApi } from '../base-api'
import api from '../base-api'

/** 商品匯入結果 */
export interface ImportProductsRes {
  /** 成功筆數 */
  successCount: number
  /** 失敗筆數 */
  failureCount: number
  /** 錯誤訊息清單 */
  errors: string[]
}

/** 將 File 轉為 base64 字串（不含 data URL 前綴） */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1]
      if (result === undefined) { reject(new Error('base64 parse failed')); return }
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** 商品匯入相關 API */
export const importApi = {
  /**
   * 下載商品匯入範本
   * @returns 範本內容（CSV 列陣列）
   */
  getProductTemplate: async (): Promise<string[]> => {
    return await getApi('/import/template/product')
  },

  /**
   * 商品匯入
   * @param eventId - 活動 ID
   * @param file - 上傳的 CSV / Excel 檔案
   * @returns 匯入結果
   */
  importProducts: async (eventId: number, file: File): Promise<ImportProductsRes> => {
    const fileBase64 = await fileToBase64(file)
    const blob = new Blob([fileBase64], { type: file.type })
    const formData = new FormData()
    formData.append('file', blob, file.name)
    const res = await api.post(`/import/products?eventId=${eventId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data
    // return await postApi(`/import/products?eventId=${eventId}`,{file:file})
  },
}
