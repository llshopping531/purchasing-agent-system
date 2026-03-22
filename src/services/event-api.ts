import { getApi, postApi } from './base-api'

export interface EventData {
  id: 1
  name: string
  startDate: string
  endDate: string
  isHidden: boolean
  extraData: ExtraData
  extraDataJson: string
}

export interface ExtraData {
  additionalProp1: string
  additionalProp2: string
  additionalProp3: string
}

export interface PostEventsReq {
  name: string
  startDate?: Date
  endDate?: Date
  isHidden?: boolean
  extraData?: ExtraData
}

export const eventApi = {
  getEventsAll: async (): Promise<EventData[]> => {
    return await getApi('/events/all')
  },
  postEvents: async (req:PostEventsReq): Promise<EventData[]> => {
    return await postApi('/events', req)
  },
}
