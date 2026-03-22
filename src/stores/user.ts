import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isLogin: localStorage.getItem('isLogin') === 'true',
    isAdmin: true,
    name: '',
    redirectPath: '',
  }),
  getters: {
    greeting: (state) => `Hello, ${state.name || 'Guest'}`,
  },
  actions: {
    login(user: { name: string; admin: boolean }) {
      localStorage.setItem('isLogin', 'true')
      this.isLogin = true
      this.isAdmin = user.admin
      this.name = user.name
    },
    logout() {
      localStorage.setItem('isLogin', 'false')
      this.isLogin = false
      this.isAdmin = false
      this.name = ''
    },
    setRedirect(path: string) {
      this.redirectPath = path
    },
  },
})
