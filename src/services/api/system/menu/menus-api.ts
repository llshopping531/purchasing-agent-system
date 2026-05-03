import { getApi } from '../../base-api'
import type { QueryMenusReq, QueryMenusRes } from './menus-api-interfaces'

/** 系統選單 API 集合 */
export const menusApi = {
  /**
   * 查詢系統選單（分頁）
   * @param req - 包含關鍵字、分頁與排序的查詢條件
   * @returns 分頁後的系統選單清單
   */
  getMenus: async (req?: QueryMenusReq): Promise<QueryMenusRes> => {
    return await getApi('/sys/menus', req)
  },
}
