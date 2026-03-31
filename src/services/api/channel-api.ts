import { getApi } from './base-api'

export interface Channel {
  id: number
  eventId: number
  name: string
  exchangeRate: number
  thresholdJpy: number
  extraData: ExtraData
  extraDataJson: string
}

export interface ExtraData {
  additionalProp1: string
  additionalProp2: string
  additionalProp3: string
}

export const channelApi = {
  getChannelsAll: async (eventId: number): Promise<Channel[]> => {
    return await getApi('/channels/all', { eventId: eventId })
  },
}
