import { defineStore } from 'pinia'

/**
 * 全域載入狀態 Store
 * 由 base-api 在每次 API 請求前後呼叫，控制 LoadingComponent 的顯示與隱藏
 */
export const useLoadingStore = defineStore('loading', {
  state: () => ({
    /** 是否正在載入中 */
    isLoading: false,
  }),
  actions: {
    /** 開始載入（顯示遮罩） */
    open() {
      this.isLoading = true
    },
    /** 結束載入（隱藏遮罩） */
    close() {
      this.isLoading = false
    },
  },
})
