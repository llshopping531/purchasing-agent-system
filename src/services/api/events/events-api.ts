import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateEventsReq,
  CreateEventsRes,
  ModifyEventsReq,
  ModifyEventsRes,
  QueryEventsAllRes,
  QueryEventsReq,
  QueryEventsRes,
} from './events-api-interfaces'

/** 活動相關 API 集合 */
export const eventApi = {
  /**
   * 取得所有活動（分頁）
   * @returns 活動清單
   */
  getEvents: async (req:QueryEventsReq): Promise<QueryEventsRes> => {
    return await getApi('/events',req)
  },

  /**
   * 取得所有活動（不分頁）
   * @returns 活動清單
   */
  getEventsAll: async (): Promise<QueryEventsAllRes[]> => {
    return await getApi('/events/all')
  },

  /**
   * 新增活動
   * @param req - 新增活動所需欄位
   * @returns 新增後的活動清單
   */
  postEvents: async (req: CreateEventsReq): Promise<CreateEventsRes[]> => {
    return await postApi('/events', req)
  },

  /**
   * 修改活動
   * @param req - 要更新的活動欄位
   * @param id - 活動 ID
   * @returns 修改後的活動清單
   */
  patchEvents: async (id: number, req: ModifyEventsReq): Promise<ModifyEventsRes[]> => {
    return await patchApi(`/events/${id}`, req)
  },

  /**
   * 刪除活動
   * @param id - 活動 ID
   * @returns 刪除後的活動清單
   */
  deleteEvents: async (id: number): Promise<undefined> => {
    return await deleteApi(`/events/${id}`)
  },
}
