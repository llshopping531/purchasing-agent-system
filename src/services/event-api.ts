import { getApi } from "./base-api"


export interface Event {
  id: 1
  name: string
  startDate: string
  endDate: string
  isHidden: boolean
  extraData: {
    additionalProp1: string
    additionalProp2: string
    additionalProp3: string
  }
  extraDataJson: string
}

export const eventApi = {
  getEventsAll: async (): Promise<Event[]> => {
    return await getApi('/events/all')
  },
}
