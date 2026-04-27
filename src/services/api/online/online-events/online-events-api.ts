import { getApi } from '../../base-api'
import type {
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
}
