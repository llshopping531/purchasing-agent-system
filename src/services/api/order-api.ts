import { getApi, patchApi } from './base-api'

export interface OrderAllReq {
  eventId: number
  channelId: number
  page?: number
  size?: number
  sort?: string
  direction?: string
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
  getOrders: async (data: OrderAllReq): Promise<OrderAllRes> => {
    return await getApi('/orders', data)
  },
  patchOrders: async (data: OrderAllReq): Promise<OrderAllRes> => {
    return await patchApi('/orders', data)
  },
}
