import { defineStore } from 'pinia'

type SearchPageName =
  | 'ORDER'
  | 'CUSTOMER_ORDERS'
  | 'PURCHASE_LIST'
  | 'STATS'
  | 'PROFIT_SHARE'
  | 'PRODUCT'
  | 'CHANNEL'

interface SearchStoreSetting {
  name: SearchPageName
  condition: SearchCondition
}
interface SearchCondition {
  eventId: string | null
  channelId: string | null
}

/**
 * 查詢結果快取 Store
 */
export const useSearchStore = defineStore('search', {
  state: () => ({
    /** 查詢條件暫存列表 */
    searchConditonList: [] as SearchStoreSetting[],
  }),
  actions: {
    setSearchStore(searchStoreSetting: SearchStoreSetting) {
      if (this.searchConditonList.length === 0) {
        this.searchConditonList = [searchStoreSetting]
      } else {
        const currentSearchConditon = this.searchConditonList.find(
          (conditon) => conditon.name === searchStoreSetting.name,
        )
        if (currentSearchConditon) {
          currentSearchConditon.condition = searchStoreSetting.condition
        } else {
          this.searchConditonList.push(searchStoreSetting)
        }
      }
    },

    getSearchStore(key: SearchPageName): SearchCondition | undefined {
      return this.searchConditonList.find((conditon) => conditon.name === key)?.condition
    },
  },
})
