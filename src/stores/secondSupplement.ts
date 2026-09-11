import { defineStore } from 'pinia'

export interface SupplementOrder {
  id: number
  customerName: string
  productName: string
  quantity: number
  weightG: number
  shippingFee: number
  note: string
}

export interface SupplementBill {
  id: number
  name: string
  eventIds: number[]
  eventNames: string[]
  internationalShippingTotal: number
  pricePerKg: number
  totalWeightG: number
  orders: SupplementOrder[]
  createdAt: string
}

let nextId = 1

export const useSecondSupplementStore = defineStore('secondSupplement', {
  state: () => ({
    bills: [] as SupplementBill[],
  }),
  actions: {
    create(data: Omit<SupplementBill, 'id'>) {
      this.bills.push({ id: nextId++, ...data })
    },
    update(data: SupplementBill) {
      const idx = this.bills.findIndex((b) => b.id === data.id)
      if (idx !== -1) this.bills[idx] = data
    },
    remove(id: number) {
      this.bills = this.bills.filter((b) => b.id !== id)
    },
    getById(id: number): SupplementBill | undefined {
      return this.bills.find((b) => b.id === id)
    },
  },
})
