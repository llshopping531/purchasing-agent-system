import { deleteApi, getApi, patchApi, postApi } from './base-api'

/** 活動完整資料 */
export interface EventData {
  /** 活動 ID */
  id: number
  /** 活動名稱 */
  name: string
  /** 開始日期（YYYY-MM-DD） */
  startDate: string
  /** 結束日期（YYYY-MM-DD） */
  endDate: string
  /** 是否隱藏（不對外顯示） */
  isHidden: boolean
  /** 自定義擴充欄位（物件格式） */
  extraData: ExtraData
  /** 自定義擴充欄位（JSON 字串格式） */
  extraDataJson: string
}

/** 活動自定義擴充欄位 */
export interface ExtraData {
  /** 擴充屬性 1 */
  additionalProp1: string
  /** 擴充屬性 2 */
  additionalProp2: string
  /** 擴充屬性 3 */
  additionalProp3: string
}

/** 新增／修改活動的請求 body */
export interface PostEventsReq {
  /** 活動名稱 */
  name: string
  /** 開始日期 */
  startDate?: string
  /** 結束日期 */
  endDate?: string
  /** 是否隱藏 */
  isHidden?: boolean
  /** 自定義擴充欄位 */
  extraData?: ExtraData
}

/** 指定單一活動的 URL 路徑參數 */
export interface EventsParams {
  /** 活動 ID */
  id: number
}

/** 活動相關 API 集合 */
export const eventApi = {
  /**
   * 取得所有活動（不分頁）
   * @returns 活動清單
   */
  getEventsAll: async (): Promise<EventData[]> => {
    return await getApi('/events/all')
  },

  /**
   * 新增活動
   * @param req - 新增活動所需欄位
   * @returns 新增後的活動清單
   */
  postEvents: async (req: PostEventsReq): Promise<EventData[]> => {
    return await postApi('/events', req)
  },

  /**
   * 修改活動
   * @param req - 要更新的活動欄位
   * @param params - 包含目標活動 ID 的路徑參數
   * @returns 修改後的活動清單
   */
  patchEvents: async (req: PostEventsReq, params: EventsParams): Promise<EventData[]> => {
    return await patchApi(`/events/${params.id}`, req)
  },

  /**
   * 刪除活動
   * @param params - 包含目標活動 ID 的路徑參數
   * @returns 刪除後的活動清單
   */
  deleteEvents: async (params: EventsParams): Promise<EventData[]> => {
    return await deleteApi(`/events/${params.id}`)
  },
}
