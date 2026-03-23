import {getApi} from './base-api'

export interface PurchaseListRes {
[key: string]: AdditionalProp[];
  additionalProp1: AdditionalProp[];
  additionalProp2: AdditionalProp[];
  additionalProp3: AdditionalProp[];
}

export interface AdditionalProp {
  productName: string;
  shouldBuy:   number;
  purchased:   number;
  remaining:   number;
}


export interface PurchaseListsParams {
  eventId: number
}

export const purchaseListApi = {
  getPurchaseListsAll: async (req:PurchaseListsParams): Promise<PurchaseListRes> => {
    return await getApi('/orders/purchase-stats',req)
  },
}
