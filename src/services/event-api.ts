import getApi from './base-api'

export interface Event {
  value: string;
  name: string;
}

export const eventApi = {
  getEventsAll: async (): Promise<Event[]> => await getApi('/events/all'),
}
