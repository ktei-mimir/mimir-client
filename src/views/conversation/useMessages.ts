import { QueryFunction, useQuery } from 'react-query'
import { listMessages, ListMessagesResponse } from '@/api/messageApi'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'

const useMessages = (conversationId: string) => {
  const queryKey = `conversation/${conversationId}/messages`
  const authenticatedApi = useAuthenticatedApi()

  const fetchMessages: QueryFunction<ListMessagesResponse> = async () => {
    return await listMessages(authenticatedApi, conversationId)
  }

  return {
    queryKey,
    query: useQuery(queryKey, fetchMessages)
  }
}

export default useMessages
