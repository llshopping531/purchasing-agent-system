import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateOrderReq,
  CreateOrderRes,
  ModifyOrderReq,
  ModifyOrderRes,
  OrderQueryReq,
  OrderQueryRes,
} from './order-api-interfaces'

export const orderApi = {
  // 依活動 ID + 通路 ID 查詢訂單清單
  getOrders: async (req: OrderQueryReq): Promise<OrderQueryRes> => {
    return await getApi('/orders', req)
  },
  // 新增訂單
  postOrders: async (req: CreateOrderReq): Promise<CreateOrderRes> => {
    return await postApi('/orders', req)
  },
  // 修改訂單
  patchOrders: async (id: number, req: ModifyOrderReq): Promise<ModifyOrderRes> => {
    return await patchApi(`/orders/${id}`, req)
  },
  // 刪除訂單
  deleteOrders: async (id: number): Promise<void> => {
    return await deleteApi(`/orders/${id}`)
  },
}
