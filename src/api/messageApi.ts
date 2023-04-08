import { AuthenticatedApi } from '@/hooks/useAuthenticatedApi'

export type Role = 'user' | 'assistant'

export type Message = {
  role: Role
  content: string
  createdAt: number
}

export type ListMessagesResponse = {
  items: Message[]
}

export const listMessages = (api: AuthenticatedApi, conversationId: string) =>
  api
    .get<ListMessagesResponse>(`v1/conversations/${conversationId}/messages`)
    .then(res => res.data)
