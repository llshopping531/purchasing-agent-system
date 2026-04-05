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

export const productsApi = {
  // 依活動 ID + 通路 ID 查詢商品清單（分頁）
  getProducts: async (req: QueryProductsReq): Promise<QueryProductsRes> => {
    return await getApi('/products', req)
  },
  // 依活動 ID + 通路 ID 查詢商品清單（不分頁）
  getProductsAll: async (req: QueryProductsAllReq): Promise<QueryProductsAllRes[]> => {
    return await getApi('/products/all', req)
  },
  // 查詢單一商品
  getSingleProduct: async (id: number): Promise<QueryProductsContent> => {
    return await getApi(`/products/${id}`)
  },
  // 新增商品
  postProducts: async (req: CreateProductsReq): Promise<CreateProductsRes> => {
    return await postApi('/products', req)
  },
  // 修改商品
  patchProducts: async (id: number, req: ModifyProductsReq): Promise<ModifyProductsRes> => {
    return await patchApi(`/products/${id}`, req)
  },
  // 刪除商品
  deleteProducts: async (id: number): Promise<void> => {
    return await deleteApi(`/products/${id}`)
  },
}
