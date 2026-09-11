/** 儲存結帳單對帳資料 request（一筆 = 一位顧客） */
export interface SaveCheckoutRowReq {
  /** 顧客名稱 */
  customerName: string
  /** 剩餘金額 */
  remainingAmount: number
  /** 是否已匯款 */
  remitted: boolean
  /** 是否已對帳 */
  reconciled: boolean
}

/** 儲存結帳單對帳資料 request body */
export interface SaveCheckoutBillReq {
  rows: SaveCheckoutRowReq[]
}

/** 儲存結帳單對帳資料 response */
export interface SaveCheckoutBillRes {
  success: boolean
}
