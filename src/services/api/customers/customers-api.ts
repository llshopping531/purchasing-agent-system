import { getApi, patchApi, postApi } from '../base-api'
import type {
  CreateCustomersReq,
  CreateCustomersRes,
  ModifyCustomersReq,
  ModifyCustomersRes,
  QueryCustomersAllRes,
  QueryCustomersReq,
  QueryCustomersRes,
} from './customers-api-interfaces'

/** 顧客相關 API 集合 */
export const customersApi = {
  /**
   * 查詢顧客清單（分頁）
   * @param req - 分頁與篩選參數
   * @returns 分頁後的顧客清單
   */
  getCustomers: async (req: QueryCustomersReq): Promise<QueryCustomersRes> => {
    return await getApi('/customers', req)
  },

  /**
   * 查詢所有顧客（不分頁）
   * @returns 全部顧客清單
   */
  getCustomersAll: async (): Promise<QueryCustomersAllRes[]> => {
    return await getApi('/customers/all')
  },

  /**
   * 新增顧客
   * @param req - 新增顧客所需欄位
   * @returns 新增後的顧客資料
   */
  postCustomers: async (req: CreateCustomersReq): Promise<CreateCustomersRes> => {
    return await postApi('/customers', req)
  },

  /**
   * 修改顧客資料
   * @param id - 目標顧客 ID
   * @param req - 要更新的顧客欄位
   * @returns 修改後的顧客資料
   */
  patchCustomers: async (id: number, req: ModifyCustomersReq): Promise<ModifyCustomersRes> => {
    return await patchApi(`/customers/${id}`, req)
  },
}
