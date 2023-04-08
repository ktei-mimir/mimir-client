import {
  ListMessagesResponse,
  Message,
  listMessages,
  CreateMessageRequest,
  createMessage
} from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import dateUtils from '@/helpers/dateUtils'

const ViewConversation = () => {
  const { conversationId } = useParams()
  const queryClient = useQueryClient()

  const authenticatedApi = useAuthenticatedApi()
  const queryKey = `conversations/${conversationId}/messages`
  const { data, isLoading, isSuccess, isError } =
    useQuery<ListMessagesResponse>(queryKey, async () => {
      return await listMessages(authenticatedApi, conversationId ?? '')
    })

  const createMessageMutation = useMutation(
    'createMessage',
    (request: CreateMessageRequest) => createMessage(authenticatedApi, request),
    {
      onMutate: async (request: CreateMessageRequest) => {
        await queryClient.cancelQueries(queryKey)

        const previousData =
          queryClient.getQueryData<ListMessagesResponse>(queryKey)

        if (previousData) {
          queryClient.setQueryData<ListMessagesResponse>(queryKey, oldData => {
            return {
              ...oldData,
              items: [
                ...(oldData?.items ?? []),
                {
                  content: request.content,
                  role: 'user',
                  createdAt: dateUtils.getCurrentUnixTimestamp()
                }
              ]
            }
          })
        }

        return previousData
      },
      onError: (err, variables, context?: ListMessagesResponse) => {
        if (context?.items) {
          queryClient.setQueryData(queryKey, context.items)
        }
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(queryKey)
      }
    }
  )

  const handleMessageSubmit = async (message: string) => {
    if (!conversationId) {
      return
    }
    await createMessageMutation.mutate({
      conversationId: conversationId,
      content: message
    })
  }

  return (
    <>
      <div className="flex w-full flex-col overflow-auto pb-28">
        {isError ? (
          <p className="text-red-900">
            There was a problem with fetching quotes
          </p>
        ) : null}
        {isLoading ? <p>Fetching messages</p> : null}
        {isSuccess ? (
          <ul className="space-y-2 text-sm">
            {data?.items.map((message: Message) => (
              <ChatMessage
                key={`${message.role}:${message.createdAt}`}
                text={message.content}
                role={message.role}
              />
            ))}
          </ul>
        ) : null}
      </div>
      <UserInput onSubmit={handleMessageSubmit} />
    </>
  )
}

export default ViewConversation
