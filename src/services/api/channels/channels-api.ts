import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateChannelReq,
  CreateChannelRes,
  ModifyChannelReq,
  ModifyChannelRes,
  QueryChannelsAllReq,
  QueryChannelsAllRes,
  QueryChannelsContent,
  QueryChannelsReq,
  QueryChannelsRes,
} from './channels-api-interfaces'

/** 通路資料型別（與查詢結果內容相同） */
export type ChannelContent = QueryChannelsContent

/** 通路相關 API 集合 */
export const channelApi = {
  /**
   * 依活動 ID 查詢通路清單（分頁）
   * @param req - 包含活動 ID 及分頁參數的查詢條件
   * @returns 分頁後的通路清單
   */
  getChannels: async (req: QueryChannelsReq): Promise<QueryChannelsRes> => {
    return await getApi('/channels', req)
  },

  /**
   * 依活動 ID 查詢通路清單（不分頁）
   * @param req - 包含活動 ID 的查詢條件
   * @returns 全部通路清單
   */
  getChannelsAll: async (req: QueryChannelsAllReq): Promise<QueryChannelsAllRes[]> => {
    return await getApi('/channels/all', req)
  },

  /**
   * 新增通路
   * @param req - 新增通路所需欄位
   * @returns 新增後的通路資料
   */
  postChannels: async (req: CreateChannelReq): Promise<CreateChannelRes> => {
    return await postApi('/channels', req)
  },

  /**
   * 修改通路
   * @param id - 目標通路 ID
   * @param req - 要更新的通路欄位
   * @returns 修改後的通路資料
   */
  patchChannels: async (id: number, req: ModifyChannelReq): Promise<ModifyChannelRes> => {
    return await patchApi(`/channels/${id}`, req)
  },

  /**
   * 刪除通路
   * @param id - 目標通路 ID
   */
  deleteChannels: async (id: number): Promise<void> => {
    return await deleteApi(`/channels/${id}`)
  },
}
