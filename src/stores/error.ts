import { defineStore } from 'pinia'

/**
 * 全域錯誤彈窗 Store
 * 由 base-api 在 API 回應 code !== 200 時呼叫，顯示錯誤訊息
 */
export const useErrorStore = defineStore('error', {
  state: () => ({
    /** 是否顯示錯誤彈窗 */
    isVisible: false,
    /** 錯誤訊息內容 */
    message: '',
  }),
  actions: {
    /** 顯示錯誤彈窗 */
    show(message: string) {
      this.message = message
      this.isVisible = true
    },
    /** 關閉錯誤彈窗 */
    close() {
      this.isVisible = false
      this.message = ''
    },
  },
})
