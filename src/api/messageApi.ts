import { AuthenticatedApi } from '@/hooks/useAuthenticatedApi'

export type Role = 'user' | 'assistant'

export type Message = {
  streamId?: string
  role: Role
  content?: string
  createdAt: number
  isStreaming?: boolean
}

export type ListMessagesResponse = {
  items: Message[]
}

export type CreateMessageRequest = {
  streamId: string
  conversationId: string
  content: string
  connectionId?: string
}

export type CreateMessageResponse = {
  createdAt: number
  role: string
  content: string
}

export const listMessages = (api: AuthenticatedApi, conversationId: string) =>
  api
    .get<ListMessagesResponse>(`conversations/${conversationId}/messages`)
    .then(res => res.data)

export const createMessage = (
  api: AuthenticatedApi,
  request: CreateMessageRequest
) =>
  api
    .post<CreateMessageResponse>(
      `conversations/${request.conversationId}/messages`,
      request
    )
    .then(res => res.data)
