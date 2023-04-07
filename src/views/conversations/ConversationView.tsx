import { ListMessagesResponse, Message, listMessages } from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import { useAuth0 } from '@auth0/auth0-react'
import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

const ConversationView = () => {
  const { conversationId } = useParams()

  const { getAccessTokenSilently } = useAuth0()

  const { data, isLoading, isSuccess, isError } =
    useQuery<ListMessagesResponse>('messages', async () => {
      const token = await getAccessTokenSilently()
      const response = await listMessages(token, conversationId!)
      return response
    })
  return (
    <>
      <div className="flex flex-col w-full overflow-auto pb-28">
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

export default ConversationView
