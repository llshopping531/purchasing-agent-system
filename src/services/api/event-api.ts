import { deleteApi, getApi, patchApi, postApi } from './base-api'

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
  startDate?: string
  endDate?: string
  isHidden?: boolean
  extraData?: ExtraData
}

export interface EventsParams {
  id: number
}

export const eventApi = {
  getEventsAll: async (): Promise<EventData[]> => {
    return await getApi('/events/all')
  },
  postEvents: async (req: PostEventsReq): Promise<EventData[]> => {
    return await postApi('/events', req)
  },
  patchEvents: async (req: PostEventsReq, params: EventsParams): Promise<EventData[]> => {
    return await patchApi(`/events/${params.id}`, req)
  },
  deleteEvents: async (params: EventsParams): Promise<EventData[]> => {
    return await deleteApi(`/events/${params.id}`)
  },
}
