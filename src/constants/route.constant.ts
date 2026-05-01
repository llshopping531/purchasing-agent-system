/** 全站路由根路徑，修改此處即可同步所有路由 */
export const BASE = '/LLShoppingjpAdmin'
export const BASE_ADMIN = `${BASE}/admin`

/** 全站路由路徑常數，統一管理避免硬編碼字串散落各處 */
export const PATH = {
  /** 首頁 */
  home: BASE,
  /** 登入頁 */
  login: `${BASE}/login`,
  /** 使用者前台 */
  user: '/user',
  /** 管理者後台入口 */
  admin: BASE_ADMIN,

  /** 場販專區入口 */
  offline: `${BASE_ADMIN}/offline`,
  /** 場販－活動管理 */
  offlineEvent: `${BASE_ADMIN}/offline/event`,
  /** 場販－訂單管理 */
  offlineOrder: `${BASE_ADMIN}/offline/order`,
  /** 場販－採購清單 */
  offlinePurchaseList: `${BASE_ADMIN}/offline/purchaseList`,
  /** 場販－顧客管理 */
  offlineCustomer: `${BASE_ADMIN}/offline/customer`,
  /** 場販－商品管理 */
  offlineProduct: `${BASE_ADMIN}/offline/product`,
  /** 場販－包貨清單 */
  offlinePackingList: `${BASE_ADMIN}/offline/packingList`,
  /** 場販－通路管理 */
  offlineChannel: `${BASE_ADMIN}/offline/channel`,
  /** 場販－訂單總覽 */
  offlineStats: `${BASE_ADMIN}/offline/stats`,
  /** 場販－分潤查詢 */
  offlineProfitShare: `${BASE_ADMIN}/offline/profitShare`,
  /** 場販－活動結算 */
  offlineSettlement: `${BASE_ADMIN}/offline/settlement`,

  /** 通販專區入口 */
  online: `${BASE_ADMIN}/online`,
  /** 通販－活動管理 */
  onlineEvent: `${BASE_ADMIN}/online/event`,
  /** 通販－商品管理 */
  onlineProduct: `${BASE_ADMIN}/online/product`,
  /** 通販－訂單管理 */
  onlineOrder: `${BASE_ADMIN}/online/order`,

  /** 包貨清單專區 */
  packing: `${BASE_ADMIN}/packing`,

  /** 系統專區入口 */
  system: `${BASE_ADMIN}/system`,
  /** 系統－Threads 留言查詢 */
  systemThreads: `${BASE_ADMIN}/system/threads`,
}
