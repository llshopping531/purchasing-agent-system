import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateDrawsResultReq,
  CreateDrawsResultRes,
  CreateOrderReq,
  CreateOrderRes,
  GetDrawsResultRes,
  ModifyDrawsResultReq,
  ModifyDrawsResultRes,
  ModifyOrderReq,
  ModifyOrderRes,
  OrderQueryContent,
  OrderQueryReq,
  OrderQueryRes,
} from './order-api-interfaces'

/** 訂單資料型別（與查詢結果內容相同） */
export type OrderAllContent = OrderQueryContent

/** 訂單相關 API 集合 */
export const orderApi = {
  /**
   * 依活動 ID + 通路 ID 查詢訂單清單（分頁）
   * @param req - 包含活動 ID、通路 ID 及分頁參數的查詢條件
   * @returns 分頁後的訂單清單
   */
  getOrders: async (req: OrderQueryReq): Promise<OrderQueryRes> => {
    return await getApi('/orders', req)
  },

  /**
   * 新增訂單
   * @param req - 新增訂單所需欄位
   * @returns 新增後的訂單資料
   */
  postOrders: async (req: CreateOrderReq): Promise<CreateOrderRes> => {
    return await postApi('/orders', req)
  },

  /**
   * 修改訂單
   * @param id - 目標訂單 ID
   * @param req - 要更新的訂單欄位
   * @returns 修改後的訂單資料
   */
  patchOrders: async (id: number, req: ModifyOrderReq): Promise<ModifyOrderRes> => {
    return await patchApi(`/orders/${id}`, req)
  },

  /**
   * 刪除訂單
   * @param id - 目標訂單 ID
   */
  deleteOrders: async (id: number): Promise<void> => {
    return await deleteApi(`/orders/${id}`)
  },

  /**
   * 查詢訂單的抽取結果
   * @param orderId - 訂單 Id
   * @returns 分頁後的訂單清單
   */
  getDrawsResult: async (orderId: number): Promise<GetDrawsResultRes> => {
    return await getApi(`/orders/${orderId}/draws`)
  },

  /**
   * 新增訂單的抽取結果
   * @param req - 新增訂單所需欄位
   * @returns 新增後的訂單資料
   */
  postDrawsResult: async (orderId: number,req: CreateDrawsResultReq): Promise<CreateDrawsResultRes> => {
    return await postApi(`/orders/${orderId}/draws`, req)
  },

  /**
   * 修改訂單的抽取結果
   * @param id - 目標訂單 ID
   * @param req - 要更新的訂單欄位
   * @returns 修改後的訂單資料
   */
  patchDrawsResult: async (orderId: number, req: ModifyDrawsResultReq): Promise<ModifyDrawsResultRes> => {
    return await patchApi(`/orders/draws/${orderId}`, req)
  },

  /**
   * 刪除訂單的抽取結果
   * @param id - 目標訂單 ID
   */
  deleteDrawsResult: async (orderId: number): Promise<void> => {
    return await deleteApi(`/orders/draws/${orderId}`)
  },
}
