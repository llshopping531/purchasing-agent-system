import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: false,
    isAdmin: false,
    name: '',
    redirectPath: '',
  }),
  getters: {
    greeting: (state) => `Hello, ${state.name || 'Guest'}`,
  },
  actions: {
    login(user: { name: string; admin: boolean }) {
      this.isLogin = true
      this.isAdmin = user.admin
      this.name = user.name
    },
    logout() {
      this.isLogin = false
      this.isAdmin = false
      this.name = ''
    },
    setRedirect(path:string) {
      this.redirectPath = path
    },
  },
})
