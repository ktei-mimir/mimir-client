import api from '@/api/api'

export type Role = 'user' | 'assistant'

export type Message = {
  role: Role
  content: string
  createdAt: number
}

export type ListMessagesResponse = {
  items: Message[]
}

export const listMessages = (accessToken: string, conversationId: string) =>
  api
    .get<ListMessagesResponse>(`v1/conversations/${conversationId}/messages`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    .then(res => res.data)
