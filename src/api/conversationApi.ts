import api from '@/api/api'

export type Conversation = {
  id: string
  title: string
}

export type ListConversationsResponse = {
  items: Conversation[]
}

export const listConversations = (accessToken: string) =>
  api
    .get<ListConversationsResponse>('v1/conversations', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(res => res.data)
