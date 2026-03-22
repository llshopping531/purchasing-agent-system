import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('../views/UserView.vue'),
      children: [
        {
          path: 'disboard',
          name: 'userDisboard',
          meta: { requiresAuth: true },
          component: () => import('../views/user/UserDisboard.vue'),
        },
      ],
    },
    {
      path: '/admin',
      name: 'admin',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/AdminView.vue'),
      children: [
        {
          path: 'offline',
          name: 'offline',
          component: () => import('../views/admin/offlineView.vue'),
          children: [
            {
              path: '',
              redirect: '/admin/offline/order',
            },
            {
              path: 'order',
              name: 'OrderView',
              component: () => import('../views/admin/offline/OrderView.vue'),
            },
            {
              path: ':id',
              name: 'EventView',
              component: () => import('../views/admin/offline/EventView.vue'),
            },
          ],
        },
        {
          path: 'online',
          name: 'online',
          component: () => import('../views/admin/onlineView.vue'),
        },
      ],
    },
  ],
})

// 全域路由守衛
router.beforeEach((to) => {
  const userStore = useUserStore()

  // 可以直接 return 路徑或 undefined
  if (to.meta.requiresAuth && !userStore.isLogin) {
    userStore.setRedirect(to.fullPath)
    return '/login'
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) return '/'

  // 如果沒有問題，就 return undefined 或不寫
})

export default router
