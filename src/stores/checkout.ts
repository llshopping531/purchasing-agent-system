import { defineStore } from 'pinia'

// ── 結帳單資料型別 ────────────────────────────────────────────

export interface CheckoutRowItem {
  name: string
  quantity: number
  unitPrice: number
  itemTotal: number
}

export interface CheckoutRowEvent {
  eventName: string
  items: CheckoutRowItem[]
}

export interface CheckoutRowData {
  customerName: string
  eventList: CheckoutRowEvent[]
  total: string
  _totalAmount: number
  /** 已匯款金額（台幣） */
  remittedAmount: number
  reconciled: boolean
  note: string
}

export type CheckoutBillStatus = '未收款' | '收款中' | '已收款'

export interface CheckoutBill {
  id: number
  /** 結帳單名稱 */
  name: string
  /** 截止日（yyyy-MM-dd） */
  deadline: string
  /** 收款狀態 */
  status: CheckoutBillStatus
  /** 選取的通販活動 ID 列表 */
  eventIds: number[]
  /** 選取的通販活動名稱（顯示用） */
  eventNames: string[]
  /** 各顧客結帳資料列 */
  rows: CheckoutRowData[]
  /** 所有顧客合計 */
  total: number
  /** 建立時間 */
  createdAt: string
}

let nextId = 1

export const useCheckoutStore = defineStore('checkout', {
  state: () => ({
    bills: [] as CheckoutBill[],
  }),
  actions: {
    create(data: Omit<CheckoutBill, 'id'>) {
      this.bills.push({ id: nextId++, ...data })
    },
    update(data: CheckoutBill) {
      const idx = this.bills.findIndex((b) => b.id === data.id)
      if (idx !== -1) this.bills[idx] = data
    },
    remove(id: number) {
      this.bills = this.bills.filter((b) => b.id !== id)
    },
    getById(id: number): CheckoutBill | undefined {
      return this.bills.find((b) => b.id === id)
    },
  },
})
