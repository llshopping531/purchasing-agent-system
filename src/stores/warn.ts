import { defineStore } from 'pinia'

/**
 * 全域警告彈窗 Store
 * 由 base-api 在偵測到連續重複請求時呼叫
 */
export const useWarnStore = defineStore('warn', {
  state: () => ({
    /** 是否顯示警告彈窗 */
    isVisible: false,
    /** 警告訊息內容 */
    message: '',
  }),
  actions: {
    /** 顯示警告彈窗 */
    show(message: string) {
      this.message = message
      this.isVisible = true
    },
    /** 關閉警告彈窗 */
    close() {
      this.isVisible = false
      this.message = ''
    },
  },
})
