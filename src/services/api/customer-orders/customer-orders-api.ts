import { getApi } from '../base-api'
import type {
  GetCustomerOrdersCustomersReq,
  GetCustomerOrdersCustomersRes,
  GetCustomerOrdersReq,
  GetCustomerOrdersRes,
  GetChannelBonusReq,
  GetChannelBonusRes,
} from './customer-orders-api-interfaces'

/** 個人購物清單相關 API 集合 */
export const customerOrdersApi = {
  /**
   * 查詢活動內有訂單的客戶清單
   * @param req - 包含活動 ID 的查詢條件
   * @returns 有訂單的客戶清單
   */
  getCustomers: async (req: GetCustomerOrdersCustomersReq): Promise<GetCustomerOrdersCustomersRes> => {
    return await getApi('/stats/customer-orders/customers', req)
  },

  /**
   * 查詢客戶在活動內的個人訂單清單
   * @param req - 包含客戶 ID 與活動 ID 的查詢條件
   * @returns 該客戶的訂單清單
   */
  getCustomerOrders: async (req: GetCustomerOrdersReq): Promise<GetCustomerOrdersRes> => {
    return await getApi('/stats/customer-orders', req)
  },

  /**
   * 查詢客戶在活動內各通路滿額狀態
   * @param req - 包含客戶 ID 與活動 ID 的查詢條件
   * @returns 各通路滿額狀態清單
   */
  getChannelBonus: async (req: GetChannelBonusReq): Promise<GetChannelBonusRes> => {
    return await getApi('/stats/customer-orders/channel-bonus', req)
  },
}
