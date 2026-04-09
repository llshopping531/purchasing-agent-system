import { defineStore } from 'pinia'

/**
 * 使用者狀態 Store
 * 管理登入狀態、身分資訊及登入後跳轉路徑
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    /** 是否已登入（從 localStorage 初始化） */
    isLogin: localStorage.getItem('isLogin') === 'true',
    /** 是否為管理員 */
    isAdmin: true,
    /** 使用者名稱 */
    name: '',
    /** 登入後要跳轉的目標路徑（用於保留未登入前欲前往的頁面） */
    redirectPath: '',
  }),
  getters: {
    /**
     * 取得問候語
     * @param state - 目前 store 狀態
     * @returns 包含使用者名稱的問候字串
     */
    greeting: (state) => `Hello, ${state.name || 'Guest'}`,
  },
  actions: {
    /**
     * 執行登入，將使用者資訊寫入 store 並持久化至 localStorage
     * @param user - 包含名稱與管理員身分的使用者物件
     */
    login(user: { token: string; role: string }) {
      localStorage.setItem('isLogin', 'true')
      localStorage.setItem('token', user.token)
      this.isLogin = true
      this.isAdmin = user.role === 'ROLE_ADMIN'
    },

    /**
     * 執行登出，清除 store 中的使用者資訊並更新 localStorage
     */
    logout() {
      localStorage.removeItem('isLogin')
      localStorage.removeItem('token')
      this.isLogin = false
      this.isAdmin = false
      this.name = ''
    },

    /**
     * 設定登入後的跳轉路徑
     * @param path - 要跳轉的完整路由路徑
     */
    setRedirect(path: string) {
      this.redirectPath = path
    },
  },
})
