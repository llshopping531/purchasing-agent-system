import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CreateOnlineProductsReq,
  CreateOnlineProductsRes,
  GetOnlineProductByIdRes,
  ModifyOnlineProductsReq,
  ModifyOnlineProductsRes,
  QueryOnlineProductsReq,
  QueryOnlineProductsRes,
} from './online-products-api-interfaces'

/** 通販商品相關 API 集合 */
export const onlineProductsApi = {
  /**
   * 取得所有通販商品（分頁）
   * @param req - 包含活動 ID 及分頁參數的查詢條件
   * @returns 分頁後的通販商品清單
   */
  getOnlineProducts: async (req: QueryOnlineProductsReq): Promise<QueryOnlineProductsRes> => {
    return await getApi('/online-products', req)
  },

  /**
   * 查詢單一通販商品
   * @param id - 商品 ID
   * @returns 通販商品資料
   */
  getOnlineProductById: async (id: number): Promise<GetOnlineProductByIdRes> => {
    return await getApi(`/online-products/${id}`)
  },

  /**
   * 新增通販商品
   * @param req - 新增通販商品所需欄位
   * @returns 新增後的通販商品資料
   */
  postOnlineProducts: async (req: CreateOnlineProductsReq): Promise<CreateOnlineProductsRes> => {
    return await postApi('/online-products', req)
  },

  /**
   * 修改通販商品
   * @param id - 目標商品 ID
   * @param req - 要更新的通販商品欄位
   * @returns 修改後的通販商品資料
   */
  patchOnlineProducts: async (id: number, req: ModifyOnlineProductsReq): Promise<ModifyOnlineProductsRes> => {
    return await patchApi(`/online-products/${id}`, req)
  },

  /**
   * 刪除通販商品
   * @param id - 目標商品 ID
   */
  deleteOnlineProducts: async (id: number): Promise<void> => {
    return await deleteApi(`/online-products/${id}`)
  },
}
