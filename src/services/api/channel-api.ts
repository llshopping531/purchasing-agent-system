import { getApi } from './base-api'

/** 通路（採購管道）完整資料 */
export interface Channel {
  /** 通路 ID */
  id: number
  /** 所屬活動 ID */
  eventId: number
  /** 通路名稱 */
  name: string
  /** 預設匯率 */
  exchangeRate: number
  /** 日幣免稅門檻 */
  thresholdJpy: number
  /** 自定義擴充欄位（物件格式） */
  extraData: ExtraData
  /** 自定義擴充欄位（JSON 字串格式） */
  extraDataJson: string
}

/** 通路自定義擴充欄位 */
export interface ExtraData {
  /** 擴充屬性 1 */
  additionalProp1: string
  /** 擴充屬性 2 */
  additionalProp2: string
  /** 擴充屬性 3 */
  additionalProp3: string
}

/** 通路相關 API 集合 */
export const channelApi = {
  /**
   * 依活動 ID 取得所有通路（不分頁）
   * @param eventId - 活動 ID
   * @returns 該活動下的通路清單
   */
  getChannelsAll: async (eventId: number): Promise<Channel[]> => {
    return await getApi('/channels/all', { eventId: eventId })
  },
}
