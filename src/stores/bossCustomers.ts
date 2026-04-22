import { defineStore } from 'pinia'
import { customersApi } from '@/services/api/customers/customers-api'
import type { SelectOption } from '@/interfaces/common'
import type { CustomersResBase } from '@/services/api/customers/customers-api-interfaces'

/**
 * 老闆客戶清單快取 Store
 * 只在第一次呼叫 ensure() 時載入，之後直接從快取讀取
 */
export const useBossCustomersStore = defineStore('bossCustomers', {
  state: () => ({
    /** 老闆客戶 Options 清單 */
    options: [] as SelectOption<CustomersResBase>[],
    /** 是否已載入過 */
    loaded: false,
  }),
  actions: {
    /** 確保資料已載入（若已載入則不重複呼叫 API） */
    async ensure() {
      if (this.loaded) return
      const all = await customersApi.getCustomersAll()
      this.options = all
        .filter((c) => c.isBoss)
        .map((c) => ({ value: c, name: c.name }))
      this.loaded = true
    },
  },
})
