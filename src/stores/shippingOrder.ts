import { defineStore } from 'pinia'

export interface ShippingOrderRowItem {
  name: string
  quantity: number
  unitPrice: number
  itemTotal: number
}

export interface ShippingOrderRowEvent {
  eventName: string
  items: ShippingOrderRowItem[]
}

export interface ShippingOrderRowData {
  customerName: string
  eventList: ShippingOrderRowEvent[]
  /** 剩餘未付金額（台幣） */
  remainingAmount: number
  /** 境內運費 */
  domesticShipping: number
  /** 國際運費 */
  internationalShipping: number
  /** 包材費 */
  packagingFee: number
  note: string
}

export type ShippingOrderStatus = '未出貨' | '出貨中' | '已出貨'

export interface ShippingOrderBill {
  id: number
  name: string
  deadline: string
  status: ShippingOrderStatus
  eventIds: number[]
  eventNames: string[]
  rows: ShippingOrderRowData[]
  createdAt: string
}

let nextId = 1

export const useShippingOrderStore = defineStore('shippingOrder', {
  state: () => ({
    bills: [] as ShippingOrderBill[],
  }),
  actions: {
    create(data: Omit<ShippingOrderBill, 'id'>) {
      this.bills.push({ id: nextId++, ...data })
    },
    update(data: ShippingOrderBill) {
      const idx = this.bills.findIndex((b) => b.id === data.id)
      if (idx !== -1) this.bills[idx] = data
    },
    remove(id: number) {
      this.bills = this.bills.filter((b) => b.id !== id)
    },
    getById(id: number): ShippingOrderBill | undefined {
      return this.bills.find((b) => b.id === id)
    },
  },
})
