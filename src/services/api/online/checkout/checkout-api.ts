import { patchApi } from '../../base-api'
import type { SaveCheckoutBillReq, SaveCheckoutBillRes } from './checkout-api-interfaces'

export const checkoutApi = {
  /**
   * 儲存結帳單的已匯款金額與已對帳狀態
   * @param billId - 結帳單 ID
   * @param req - 各顧客的對帳資料
   */
  saveReconciliation: async (billId: number, req: SaveCheckoutBillReq): Promise<SaveCheckoutBillRes> => {
    return await patchApi(`/checkout-bills/${billId}/reconciliation`, req)
  },
}
