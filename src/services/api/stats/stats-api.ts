import { getApi } from '../base-api'
import type {
  QueryStatsChannelTotalsReq,
  QueryStatsChannelTotalsRes,
  QueryStatsOverviewReq,
  QueryStatsOverviewRes,
  QueryStatsTotalsReq,
  QueryStatsTotalsRes,
  QueryStatsProfitShareSummaryReq,
  QueryStatsProfitShareSummaryRes,
  QueryStatsProfitShareReq,
  QueryStatsProfitShareRes,
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

  /**
   * 查詢分潤總計（台幣總額、獲利、分潤金額、比率）
   */
  getStatsProfitShareSummary: async (req: QueryStatsProfitShareSummaryReq): Promise<QueryStatsProfitShareSummaryRes> => {
    return await getApi('/stats/profit-share/summary', req)
  },

  /**
   * 查詢分潤明細（已購買且計入分潤的訂單），可選 channelId 篩選
   */
  getStatsProfitShare: async (req: QueryStatsProfitShareReq): Promise<QueryStatsProfitShareRes> => {
    return await getApi('/stats/profit-share', req)
  },
}
