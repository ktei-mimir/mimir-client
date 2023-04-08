import { ListMessagesResponse, Message, listMessages } from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'

const ViewConversation = () => {
  const { conversationId } = useParams()

  const authenticatedApi = useAuthenticatedApi()

  const { data, isLoading, isSuccess, isError } =
    useQuery<ListMessagesResponse>(
      `conversations/${conversationId}/messages`,
      async () => {
        return await listMessages(authenticatedApi, conversationId ?? '')
      }
    )
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
      <UserInput />
    </>
  )
}

export default ViewConversation
