import { AuthenticatedApi } from '@/hooks/useAuthenticatedApi'

export type Prompt = {
  id: string
  title: string
  text: string
}

export type ListPromptsResponse = {
  items: Prompt[]
}

export type CreatePromptRequest = {
  title: string
  text: string
}

export type UpdatePromptRequest = {
  id: string
  title: string
  text: string
}

export const listPrompts = (api: AuthenticatedApi) =>
  api.get<ListPromptsResponse>('prompts').then(res => res.data)

export const createPrompt = (
  api: AuthenticatedApi,
  request: CreatePromptRequest
) => api.post<Prompt>('prompts', request).then(res => res.data)

export const updatePrompt = (
  api: AuthenticatedApi,
  request: UpdatePromptRequest
) =>
  api
    .put<Prompt>(`prompts/${request.id}`, {
      title: request.title,
      text: request.text
    })
    .then(res => res.data)

export const deletePrompt = async (api: AuthenticatedApi, id: string) =>
  await api.delete(`prompts/${id}`)
