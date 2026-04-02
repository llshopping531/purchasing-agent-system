import { deleteApi, getApi, patchApi, postApi } from './base-api'

export interface OrderAllReq {
  eventId: number
  channelId: number
  page?: number
  size?: number
  sort?: string
  direction?: string
}

export interface OrderCreateReq {
  eventId: number
  channelId: number
  customerId: number
  quantity: number
  exchangeRate?: number
  subtotalJpy?: number
  subtotalTwd?: number
  orderStatus?: string
  nonBonusTarget?: boolean
  isFixedRate?: boolean
  nonCutTarget?: boolean
  purchaseConfirm?: boolean
  note?: string
  extraData?: {
    additionalProp1?: string
    additionalProp2?: string
    additionalProp3?: string
  }
}

export interface OrderUpdateReq extends Partial<OrderCreateReq> {
  productId?: number
}

export interface OrderAllRes {
  content:       OrderAllContent[];
  page:          number;
  size:          number;
  totalElements: number;
  totalPages:    number;
}

export interface OrderAllContent {
  id:              number;
  eventId:         number;
  channelId:       number;
  customerId:      number;
  productId:       number;
  quantity:        number;
  exchangeRate:    number;
  subtotalJpy:     number;
  subtotalTwd:     number;
  orderStatus:     string;
  publicNote:      string;
  adminNote:       string;
  nonBonusTarget:  boolean;
  isFixedRate:     boolean;
  nonCutTarget:    boolean;
  purchaseBatch:   string;
  purchaseConfirm: boolean;
  purchaser:       string;
  unbox:           string;
  productName:     string;
  productPriceJpy: number;
  productPriceTwd: number;
  productImage:    string;
  orderStatusName: string;
  customerName:    string;
  purchaserName:   string;
  channelName:     string;
}


export const orderApi = {
  getOrders: async (req: OrderAllReq): Promise<OrderAllRes> => {
    return await getApi('/orders', req)
  },
  postOrders: async (req: OrderCreateReq): Promise<OrderAllContent> => {
    return await postApi('/orders', req)
  },
  patchOrders: async (id: number, req: OrderUpdateReq): Promise<OrderAllContent> => {
    return await patchApi(`/orders/${id}`, req)
  },
  deleteOrders: async (id: number): Promise<void> => {
    return await deleteApi(`/orders/${id}`)
  },
}
