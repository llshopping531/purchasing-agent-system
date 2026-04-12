import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import { useUserStore } from '@/stores/user'

/**
 * Vue Router 實例
 * 使用 HTML5 History 模式，路由結構分為公開頁面、使用者前台、管理者後台三大區塊
 */
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
      /** 使用者前台，需登入才可進入子頁面 */
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
      /** 管理者後台，需登入且具管理員身分 */
      path: '/admin',
      name: 'admin',
      meta: { requiresAuth: true, requiresAdmin: true },
      component: () => import('../views/AdminView.vue'),
      children: [
        {
          /** 場販專區，預設跳轉至訂單管理 */
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
              component: () => import('../views/admin/offline/order/index.vue'),
            },
            {
              path: 'event',
              name: 'EventView',
              component: () => import('../views/admin/offline/event/index.vue'),
            },
            {
              path: 'purchaseList',
              name: 'PurchaseListView',
              component: () => import('../views/admin/offline/PurchaseListView/index.vue'),
            },
            {
              path: 'customer',
              name: 'CustomerView',
              component: () => import('../views/admin/offline/customer/index.vue'),
            },
            {
              path: 'product',
              name: 'ProductView',
              component: () => import('../views/admin/offline/product/index.vue'),
            },
            {
              path: 'customerOrders',
              name: 'CustomerOrdersView',
              component: () => import('../views/admin/offline/customerOrders/index.vue'),
            },
            {
              path: 'channel',
              name: 'ChannelView',
              component: () => import('../views/admin/offline/channel/index.vue'),
            },
            {
              path: 'stats',
              name: 'StatsView',
              component: () => import('../views/admin/offline/stats/index.vue'),
            },
            {
              path: 'profitShare',
              name: 'ProfitShareView',
              component: () => import('../views/admin/offline/profitShare/index.vue'),
            },
          ],
        },
        {
          /** 通販專區 */
          path: 'online',
          name: 'online',
          component: () => import('../views/admin/onlineView.vue'),
        },
        {
          /** 出貨單 */
          path: 'shipping',
          name: 'shipping',
          component: () => import('../views/admin/shippingView/index.vue'),
        },
        {
          /** 結帳單 */
          path: 'checkout',
          name: 'checkout',
          component: () => import('../views/admin/checkoutView.vue'),
        },
      ],
    },
  ],
})

/**
 * 全域路由守衛
 * - 未登入時存取需驗證的頁面，先記錄目標路徑再跳轉至登入頁
 * - 非管理員存取後台頁面，跳轉回首頁
 */
router.beforeEach((to) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.isLogin) {
    userStore.setRedirect(to.fullPath)
    return '/login'
  }
  if (to.meta.requiresAdmin && !userStore.isAdmin) return '/'
})

export default router
