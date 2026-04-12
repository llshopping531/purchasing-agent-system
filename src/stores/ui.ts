import { defineStore } from 'pinia'

/** 全域 UI 狀態 Store */
export const useUiStore = defineStore('ui', {
  state: () => ({
    /** 手機版側選單是否展開 */
    isSidebarOpen: false,
  }),
  actions: {
    openSidebar() {
      this.isSidebarOpen = true
    },
    closeSidebar() {
      this.isSidebarOpen = false
    },
  },
})
