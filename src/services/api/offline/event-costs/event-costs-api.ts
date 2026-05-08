import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CreateEventCostReq,
  ModifyEventCostReq,
  QueryEventCostItem,
  QueryEventCostsReq,
  QueryEventCostsTotalReq,
} from './event-costs-api-interfaces'

/** 活動成本相關 API 集合 */
export const eventCostsApi = {
  /**
   * 查詢活動成本列表
   * @param req - 含 eventId 的查詢參數
   * @returns 活動成本列表
   */
  getEventCosts: async (req: QueryEventCostsReq): Promise<QueryEventCostItem[]> => {
    return await getApi('/event-costs', req)
  },

  /**
   * 查詢活動成本總計
   * @param req - 含 eventId 的查詢參數
   * @returns 總金額
   */
  getEventCostsTotal: async (req: QueryEventCostsTotalReq): Promise<number> => {
    return await getApi('/event-costs/total', req)
  },

  /**
   * 新增活動成本
   * @param req - 新增所需欄位
   */
  postEventCost: async (req: CreateEventCostReq): Promise<void> => {
    return await postApi('/event-costs', req)
  },

  /**
   * 修改活動成本
   * @param id - 成本 ID
   * @param req - 要更新的欄位
   */
  patchEventCost: async (id: number, req: ModifyEventCostReq): Promise<void> => {
    return await patchApi(`/event-costs/${id}`, req)
  },

  /**
   * 刪除活動成本
   * @param id - 成本 ID
   */
  deleteEventCost: async (id: number): Promise<void> => {
    return await deleteApi(`/event-costs/${id}`)
  },
}
