import { getApi } from '../../base-api'
import type {
  GetOnlinePackingCustomersReq,
  GetOnlinePackingCustomersRes,
  GetOnlinePackingOrdersReq,
  GetOnlinePackingOrdersRes,
} from './online-packing-list-api-interfaces'

/** 通販包貨清單相關 API 集合 */
export const onlinePackingListApi = {
  /**
   * 查詢通販活動內有訂單的客戶清單
   * @param req - 包含活動 ID 列表的查詢條件
   * @returns 有訂單的客戶清單
   */
  getCustomers: async (req: GetOnlinePackingCustomersReq): Promise<GetOnlinePackingCustomersRes> => {
    return await getApi('/packing/online-customers', { eventIds: req.eventIds.join(',') })
  },

  /**
   * 查詢客戶在通販活動內的訂單清單
   * @param req - 包含客戶 ID 與活動 ID 列表的查詢條件
   * @returns 該客戶的通販訂單清單
   */
  getCustomerOrders: async (req: GetOnlinePackingOrdersReq): Promise<GetOnlinePackingOrdersRes> => {
    return await getApi('/packing/online-orders', {
      customerId: req.customerId,
      eventIds: req.eventIds.join(','),
    })
  },
}
