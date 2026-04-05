import { deleteApi, getApi, patchApi, postApi } from '../base-api'
import type {
  CreateCustomersReq,
  CreateCustomersRes,
  ModifyCustomersReq,
  ModifyCustomersRes,
  QueryCustomersAllRes,
  QueryCustomersReq,
  QueryCustomersRes,
} from './customers-api-interfaces'

export const customersApi = {
  // 查詢所有客戶（分頁）
  getCustomers: async (req: QueryCustomersReq): Promise<QueryCustomersRes> => {
    return await getApi('/customers', req)
  },
  // 查詢所有客戶（不分頁）
  getCustomersAll: async (): Promise<QueryCustomersAllRes[]> => {
    return await getApi('/customers/all')
  },
  // 新增客戶
  postCustomers: async (req: CreateCustomersReq): Promise<CreateCustomersRes> => {
    return await postApi('/customers', req)
  },
  // 修改客戶
  patchCustomers: async (id: number, req: ModifyCustomersReq): Promise<ModifyCustomersRes> => {
    return await patchApi(`/customers/${id}`, req)
  }
}
