import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateProductsReq,
  CreateProductsRes,
  ModifyProductsReq,
  ModifyProductsRes,
  QueryProductsAllReq,
  QueryProductsAllRes,
  QueryProductsContent,
  QueryProductsReq,
  QueryProductsRes,
} from './products-api-interfaces'

/** 商品相關 API 集合 */
export const productsApi = {
  /**
   * 依活動 ID + 通路 ID 查詢商品清單（分頁）
   * @param req - 包含活動 ID、通路 ID 及分頁參數的查詢條件
   * @returns 分頁後的商品清單
   */
  getProducts: async (req: QueryProductsReq): Promise<QueryProductsRes> => {
    return await getApi('/products', req)
  },

  /**
   * 依活動 ID + 通路 ID 查詢商品清單（不分頁）
   * @param req - 包含活動 ID 與通路 ID 的查詢條件
   * @returns 全部商品清單
   */
  getProductsAll: async (req: QueryProductsAllReq): Promise<QueryProductsAllRes[]> => {
    return await getApi('/products/all', req)
  },

  /**
   * 查詢單一商品詳細資料
   * @param id - 商品 ID
   * @returns 商品詳細資料
   */
  getSingleProduct: async (id: number): Promise<QueryProductsContent> => {
    return await getApi(`/products/${id}`)
  },

  /**
   * 新增商品
   * @param req - 新增商品所需欄位
   * @returns 新增後的商品資料
   */
  postProducts: async (req: CreateProductsReq): Promise<CreateProductsRes> => {
    return await postApi('/products', req)
  },

  /**
   * 修改商品
   * @param id - 目標商品 ID
   * @param req - 要更新的商品欄位
   * @returns 修改後的商品資料
   */
  patchProducts: async (id: number, req: ModifyProductsReq): Promise<ModifyProductsRes> => {
    return await patchApi(`/products/${id}`, req)
  },

  /**
   * 刪除商品
   * @param id - 目標商品 ID
   */
  deleteProducts: async (id: number): Promise<void> => {
    return await deleteApi(`/products/${id}`)
  },
}
