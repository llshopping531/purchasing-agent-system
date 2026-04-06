/** 全站路由路徑常數，統一管理避免硬編碼字串散落各處 */
export const PATH = {
  /** 首頁 */
  home: '/',
  /** 使用者前台 */
  user: '/user',
  /** 管理者後台入口 */
  admin: '/admin',

  /** 場販專區入口 */
  offline: '/admin/offline',
  /** 場販－活動管理 */
  offlineEvent: '/admin/offline/event',
  /** 場販－訂單管理 */
  offlineOrder: '/admin/offline/order',
  /** 場販－採購清單 */
  offlinePurchaseList: '/admin/offline/purchaseList',
  /** 場販－顧客管理 */
  offlineCustomer: '/admin/offline/customer',
  /** 場販－商品管理 */
  offlineProduct: '/admin/offline/product',

  /** 通販專區入口 */
  online: '/admin/online',
}
