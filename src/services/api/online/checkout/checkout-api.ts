import { deleteApi, getApi, patchApi, postApi } from '../../base-api'
import type {
  CheckoutBillRes,
  CreateCheckoutBillReq,
  CreateCheckoutBillRes,
  DeleteCheckoutBillRes,
  GetCheckoutBillByIdRes,
  PublicCheckoutBillRes,
  QueryCheckoutBillsReq,
  QueryCheckoutBillsRes,
  SaveCheckoutBillReq,
  SaveCheckoutBillRes,
  UpdateCheckoutBillReq,
  UpdateCheckoutBillRes,
} from './checkout-api-interfaces'

export const checkoutApi = {
  /**
   * 取得結帳單列表（可依收款狀態篩選，無分頁）
   * @param req - 查詢條件
   * @returns 結帳單清單
   */
  getCheckoutBills: async (req?: QueryCheckoutBillsReq): Promise<QueryCheckoutBillsRes> => {
    return await getApi('/checkout-bills', req)
  },

  /**
   * 取得單一結帳單（含所有 rows）
   * @param id - 結帳單 ID
   */
  getCheckoutBillById: async (id: number): Promise<GetCheckoutBillByIdRes> => {
    return await getApi(`/checkout-bills/${id}`)
  },

  /**
   * 建立結帳單（後端依 eventIds 即時彙整各顧客明細）
   * @param req - 結帳單名稱、截止日、關聯活動 ID 列表
   */
  createCheckoutBill: async (req: CreateCheckoutBillReq): Promise<CreateCheckoutBillRes> => {
    return await postApi('/checkout-bills', req)
  },

  /**
   * 更新結帳單基本資料（名稱／截止日／狀態）
   * @param id - 結帳單 ID
   * @param req - 要更新的欄位
   */
  updateCheckoutBill: async (id: number, req: UpdateCheckoutBillReq): Promise<UpdateCheckoutBillRes> => {
    return await patchApi(`/checkout-bills/${id}`, req)
  },

  /**
   * 刪除結帳單
   * @param id - 結帳單 ID
   */
  deleteCheckoutBill: async (id: number): Promise<DeleteCheckoutBillRes> => {
    return await deleteApi(`/checkout-bills/${id}`)
  },

  /**
   * 儲存結帳單的已匯款金額與已對帳狀態
   * @param billId - 結帳單 ID
   * @param req - 各顧客的對帳資料
   */
  saveReconciliation: async (billId: number, req: SaveCheckoutBillReq): Promise<SaveCheckoutBillRes> => {
    return await patchApi(`/checkout-bills/${billId}/reconciliation`, req)
  },

  /**
   * 以查詢 UUID 取得結帳單（對外分享頁面用，不需登入）
   * @param queryUuid - 結帳單的公開查詢 UUID
   */
  getPublicCheckoutBill: async (queryUuid: string): Promise<PublicCheckoutBillRes> => {
    return await getApi(`/public/checkout-bills/${queryUuid}`, undefined, true)
  },

  /**
   * 完成收款：將整張結帳單的付款狀態一次記錄到來源通販訂單上
   * @param billId - 結帳單 ID
   */
  completeCheckoutPayment: async (billId: number): Promise<CheckoutBillRes> => {
    return await postApi(`/checkout-bills/${billId}/complete-payment`, undefined)
  },
}
