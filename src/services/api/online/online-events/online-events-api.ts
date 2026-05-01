import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CreateOnlineEventsReq,
  CreateOnlineEventsRes,
  GetAllOnlineEventsRes,
  GetOnlineEventByIdRes,
  ModifyOnlineEventsReq,
  ModifyOnlineEventsRes,
  QueryOnlineEventsReq,
  QueryOnlineEventsRes,
} from './online-events-api-interfaces'

/** 通販活動相關 API 集合 */
export const onlineEventApi = {
  /**
   * 取得所有通販活動（分頁）
   * @returns 通販活動清單
   */
  getOnlineEvents: async (req: QueryOnlineEventsReq): Promise<QueryOnlineEventsRes> => {
    return await getApi('/online-events', req)
  },

  /**
   * 取得所有通販活動（不分頁）
   * @returns 完整通販活動清單
   */
  getAllOnlineEvents: async (): Promise<GetAllOnlineEventsRes> => {
    return await getApi('/online-events/all')
  },

  /**
   * 查詢單一通販活動
   * @param id - 通販活動 ID
   * @returns 通販活動資料
   */
  getOnlineEventById: async (id: number): Promise<GetOnlineEventByIdRes> => {
    return await getApi(`/online-events/${id}`)
  },

  /**
   * 新增通販活動
   * @param req - 新增通販活動所需欄位
   * @returns 新增後的通販活動資料
   */
  postOnlineEvents: async (req: CreateOnlineEventsReq): Promise<CreateOnlineEventsRes> => {
    return await postApi('/online-events', req)
  },

  /**
   * 修改通販活動
   * @param id - 目標通販活動 ID
   * @param req - 要更新的通販活動欄位
   * @returns 修改後的通販活動資料
   */
  patchOnlineEvents: async (id: number, req: ModifyOnlineEventsReq): Promise<ModifyOnlineEventsRes> => {
    return await patchApi(`/online-events/${id}`, req)
  },

  /**
   * 刪除通販活動
   * @param id - 目標通販活動 ID
   */
  deleteOnlineEvents: async (id: number): Promise<void> => {
    return await deleteApi(`/online-events/${id}`)
  },
}
