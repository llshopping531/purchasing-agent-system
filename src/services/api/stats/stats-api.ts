import { getApi } from '../base-api'
import type {
  QueryStatsChannelTotalsReq,
  QueryStatsChannelTotalsRes,
  QueryStatsOverviewReq,
  QueryStatsOverviewRes,
  QueryStatsTotalsReq,
  QueryStatsTotalsRes,
} from './stats-api-interfaces'

/** 統計相關 API 集合 */
export const statsApi = {
  /**
   * 依活動 ID 查詢訂單總覽（分頁），可選傳 channelId 篩選單一通路
   */
  getStatsOverview: async (req: QueryStatsOverviewReq): Promise<QueryStatsOverviewRes> => {
    return await getApi('/stats/overview', req)
  },

  /**
   * 查詢活動訂單金額總計（日幣 / 台幣）
   */
  getStatsTotals: async (req: QueryStatsTotalsReq): Promise<QueryStatsTotalsRes> => {
    return await getApi('/stats/totals', req)
  },

  /**
   * 查詢通路訂單金額總計（日幣 / 台幣）
   */
  getStatsChannelTotals: async (req: QueryStatsChannelTotalsReq): Promise<QueryStatsChannelTotalsRes> => {
    return await getApi('/stats/channel-totals', req)
  },
}
