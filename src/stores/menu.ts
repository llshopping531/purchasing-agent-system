import { defineStore } from 'pinia'
import { eventApi } from '@/services/api/events/events-api'
import { channelApi } from '@/services/api/channels/channels-api'
import type { EventsResBase } from '@/services/api/events/events-api-interfaces'
import type { QueryChannelsAllRes } from '@/services/api/channels/channels-api-interfaces'

/**
 * 選單快取 Store
 * 活動清單與通路清單在第一次 fetch 後快取，避免重複呼叫 API
 */
export const useMenuStore = defineStore('menu', {
  state: () => ({
    /** 全部活動清單，null 表示尚未載入 */
    eventsAll: null as EventsResBase[] | null,
    /** 各活動 ID 對應的通路清單，key 為 eventId */
    channelsAllMap: {} as Record<number, QueryChannelsAllRes[]>,
  }),
  actions: {
    /** 取得全部活動（有快取則直接回傳） */
    async fetchEventsAll(): Promise<EventsResBase[]> {
      if (this.eventsAll !== null) return this.eventsAll
      this.eventsAll = await eventApi.getEventsAll()
      return this.eventsAll
    },

    /** 取得指定活動的通路清單（有快取則直接回傳） */
    async fetchChannelsAll(eventId: number): Promise<QueryChannelsAllRes[]> {
      if (this.channelsAllMap[eventId] !== undefined) return this.channelsAllMap[eventId]
      const result = await channelApi.getChannelsAll({ eventId })
      this.channelsAllMap[eventId] = result
      return result
    },

    /** 清除活動快取（資料異動後呼叫） */
    clearEventsCache() {
      this.eventsAll = null
    },

    /** 清除指定活動的通路快取（資料異動後呼叫） */
    clearChannelsCache(eventId: number) {
      delete this.channelsAllMap[eventId]
    },
  },
})
