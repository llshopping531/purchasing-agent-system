import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CreateOnlineOfficialOrdersReq,
  CreateOnlineOfficialOrdersRes,
  GetOnlineOfficialOrderByIdRes,
  GetOnlineOfficialOrdersByEventRes,
  ModifyOnlineOfficialOrdersReq,
  ModifyOnlineOfficialOrdersRes,
  QueryOnlineOfficialOrdersReq,
  QueryOnlineOfficialOrdersRes,
} from './online-official-orders-api-interfaces'

/** 通販官方訂單相關 API 集合 */
export const onlineOfficialOrdersApi = {
  /**
   * 查詢官方訂單清單（分頁）
   * @param req - 包含活動 ID 及分頁參數的查詢條件
   * @returns 分頁後的官方訂單清單
   */
  getOnlineOfficialOrders: async (req?: QueryOnlineOfficialOrdersReq): Promise<QueryOnlineOfficialOrdersRes> => {
    return await getApi('/online-official-orders', req)
  },

  /**
   * 查詢單一官方訂單
   * @param id - 官方訂單 ID
   * @returns 官方訂單資料
   */
  getOnlineOfficialOrderById: async (id: number): Promise<GetOnlineOfficialOrderByIdRes> => {
    return await getApi(`/online-official-orders/${id}`)
  },

  /**
   * 查詢特定活動的所有官方訂單（不分頁）
   * @param eventId - 活動 ID
   * @returns 官方訂單陣列
   */
  getOnlineOfficialOrdersByEvent: async (eventId: number): Promise<GetOnlineOfficialOrdersByEventRes> => {
    return await getApi(`/online-official-orders/event/${eventId}`)
  },

  /**
   * 新增官方訂單
   * @param req - 新增官方訂單所需欄位
   * @returns 新增後的官方訂單資料
   */
  postOnlineOfficialOrders: async (req: CreateOnlineOfficialOrdersReq): Promise<CreateOnlineOfficialOrdersRes> => {
    return await postApi('/online-official-orders', req)
  },

  /**
   * 修改官方訂單
   * @param id - 目標官方訂單 ID
   * @param req - 要更新的官方訂單欄位
   * @returns 修改後的官方訂單資料
   */
  patchOnlineOfficialOrders: async (id: number, req: ModifyOnlineOfficialOrdersReq): Promise<ModifyOnlineOfficialOrdersRes> => {
    return await patchApi(`/online-official-orders/${id}`, req)
  },

  /**
   * 刪除官方訂單
   * @param id - 目標官方訂單 ID
   */
  deleteOnlineOfficialOrders: async (id: number): Promise<void> => {
    return await deleteApi(`/online-official-orders/${id}`)
  },
}
