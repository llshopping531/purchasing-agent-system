import { getApi } from '../base-api'
export interface QueryFieldDefsReq {
  entityType: string
  keyword?: string
  page?: number
  size?: number
  sort?: string
  direction?: string
}
export interface QueryFieldDefsRes {
  content: QueryFieldDefContent[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface QueryFieldDefContent {
  id: number
  entityType: string
  fieldKey: string
  fieldLabel: string
  fieldType: string
  options: null
  isRequired: boolean
  sort: number
  isActive: boolean
  isFrontendVisible: boolean
}

export const fieldDefsApi = {
  getfieldDefs: async (data: QueryFieldDefsReq): Promise<QueryFieldDefsRes> => {
    return await getApi('/sys/field-defs', data)
  },
}
