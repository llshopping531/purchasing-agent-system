import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CreateOnlineOrdersReq,
  CreateOnlineOrdersRes,
  GetOnlineOrderByIdRes,
  ModifyOnlineOrdersReq,
  ModifyOnlineOrdersRes,
  QueryOnlineOrdersReq,
  QueryOnlineOrdersRes,
} from './online-orders-api-interfaces'

/** 通販訂單相關 API 集合 */
export const onlineOrdersApi = {
  /**
   * 依活動 ID 查詢通販訂單清單（分頁）
   * @param req - 包含活動 ID 及分頁參數的查詢條件
   * @returns 分頁後的通販訂單清單
   */
  getOnlineOrders: async (req: QueryOnlineOrdersReq): Promise<QueryOnlineOrdersRes> => {
    return await getApi('/online-orders', req)
  },

  /**
   * 查詢單一通販訂單
   * @param id - 訂單 ID
   * @returns 通販訂單資料
   */
  getOnlineOrderById: async (id: number): Promise<GetOnlineOrderByIdRes> => {
    return await getApi(`/online-orders/${id}`)
  },

  /**
   * 新增通販訂單
   * @param req - 新增通販訂單所需欄位
   * @returns 新增後的通販訂單資料
   */
  postOnlineOrders: async (req: CreateOnlineOrdersReq): Promise<CreateOnlineOrdersRes> => {
    return await postApi('/online-orders', req)
  },

  /**
   * 修改通販訂單
   * @param id - 目標訂單 ID
   * @param req - 要更新的通販訂單欄位
   * @returns 修改後的通販訂單資料
   */
  patchOnlineOrders: async (id: number, req: ModifyOnlineOrdersReq): Promise<ModifyOnlineOrdersRes> => {
    return await patchApi(`/online-orders/${id}`, req)
  },

  /**
   * 刪除通販訂單
   * @param id - 目標訂單 ID
   */
  deleteOnlineOrders: async (id: number): Promise<void> => {
    return await deleteApi(`/online-orders/${id}`)
  },
}
