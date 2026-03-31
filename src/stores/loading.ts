import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    open() {
      this.isLoading = true
    },
    close() {
      this.isLoading = false
    }
  },
})
