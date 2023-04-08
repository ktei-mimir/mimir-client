import { AuthenticatedApi } from '@/hooks/useAuthenticatedApi'

export type Conversation = {
  id: string
  title: string
}

export type ListConversationsResponse = {
  items: Conversation[]
}

type CreateConversationResponse = {
  id: string
  title: string
  totalTokens: number
}

export const listConversations = (api: AuthenticatedApi) =>
  api.get<ListConversationsResponse>('v1/conversations').then(res => res.data)

export type CreateConversationRequest = {
  message: string
}
export const createConversation = (
  api: AuthenticatedApi,
  request: CreateConversationRequest
) => api.post<CreateConversationResponse>('v1/conversations', request)
