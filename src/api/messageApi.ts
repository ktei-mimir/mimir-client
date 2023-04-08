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

export type CreateMessageRequest = {
  conversationId: string
  content: string
}

export type CreateMessageResponse = {
  createdAt: number
  role: string
  content: string
}

export const listMessages = (api: AuthenticatedApi, conversationId: string) =>
  api
    .get<ListMessagesResponse>(`v1/conversations/${conversationId}/messages`)
    .then(res => res.data)

export const createMessage = (
  api: AuthenticatedApi,
  request: CreateMessageRequest
) =>
  api
    .post<CreateMessageResponse>(
      `v1/conversations/${request.conversationId}/messages`,
      request
    )
    .then(res => res.data)
