import {
  CreateMessageRequest,
  ListMessagesResponse,
  Message,
  createMessage
} from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import usePendingMessage from '@/components/conversation/conversationStore'
import dateUtils from '@/helpers/dateUtils'
import { buildConnection } from '@/helpers/signalRConnectionFactory'
import { randomUUID } from '@/helpers/stringUtils'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useMessages from '@/views/conversation/useMessages'
import { useAuth0 } from '@auth0/auth0-react'
import * as signalR from '@microsoft/signalr'
import produce from 'immer'
import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'

type StreamMessageRequest = {
  streamId: string
  conversationId: string
  content: string
}

const appendMessages = (
  conversation: ListMessagesResponse,
  ...messages: Message[]
) =>
  produce(conversation, draft => {
    messages.forEach(m => draft.items.push(m))
  })

const streamMessage = (
  conversation: ListMessagesResponse,
  streamId: string,
  content: string
) =>
  produce(conversation, draft => {
    const messageToStream = draft.items.find(m => m.streamId === streamId)
    if (!messageToStream) {
      return
    }
    messageToStream.content = content
  })

const ViewConversation = () => {
  const { conversationId } = useParams()
  if (!conversationId) throw new Error('conversationId cannot be empty')

  const queryClient = useQueryClient()

  const authenticatedApi = useAuthenticatedApi()
  const {
    queryKey,
    query: { data, isLoading, isSuccess, isError }
  } = useMessages(conversationId)

  const createMessageMutation = useMutation(
    'createMessage',
    (request: CreateMessageRequest) => createMessage(authenticatedApi, request),
    {
      onMutate: async (request: CreateMessageRequest) => {
        await queryClient.cancelQueries(queryKey)

        const currentData =
          queryClient.getQueryData<ListMessagesResponse>(queryKey)

        if (currentData) {
          queryClient.setQueryData<ListMessagesResponse>(queryKey, oldData => {
            const userMessage: Message = {
              content: request.content,
              role: 'user',
              createdAt: dateUtils.getUtcNowTicks()
            }
            const assistantMessage: Message = {
              streamId: request.streamId,
              content: '',
              role: 'assistant',
              createdAt: dateUtils.getUtcNowTicks() + 1
            }
            return appendMessages(
              oldData ?? { items: [] },
              userMessage,
              assistantMessage
            )
          })
        }

        return currentData
      },
      onError: (err, variables, context?: ListMessagesResponse) => {
        if (context) {
          queryClient.setQueryData(queryKey, context)
        }
      },
      onSettled: async () => {
        await queryClient.invalidateQueries(queryKey)
      }
    }
  )

  const hubConnection = useRef<signalR.HubConnection | undefined>()

  const handleMessageSubmit = async (message: string) => {
    if (!conversationId) {
      return
    }
    if (!hubConnection.current || !hubConnection.current.connectionId) {
      return
    }
    await createMessageMutation.mutate({
      streamId: randomUUID(),
      conversationId: conversationId,
      content: message
    })
  }

  const { pendingMessage, clearPendingMessage } = usePendingMessage()
  const currentPendingMessage = useRef(pendingMessage)

  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const messageToCreate = currentPendingMessage.current
    currentPendingMessage.current = ''
    async function sendPendingMessage() {
      if (!conversationId) return
      if (messageToCreate.trim().length > 0) {
        clearPendingMessage()
        await createMessageMutation.mutate({
          streamId: randomUUID(),
          conversationId: conversationId,
          content: messageToCreate
        })
      }
    }

    if (!hubConnection.current) {
      const connection = buildConnection(getAccessTokenSilently)
      connection.on('StreamMessage', (m: StreamMessageRequest) => {
        if (m.conversationId !== conversationId) return
        let currentConversation =
          queryClient.getQueryData<ListMessagesResponse>(queryKey)
        if (!currentConversation) return
        currentConversation = streamMessage(
          currentConversation,
          m.streamId,
          m.content
        )
        queryClient.setQueryData(queryKey, currentConversation)
      })
      hubConnection.current = connection
      connection.start().then(() => {
        if (connection.connectionId) {
          sendPendingMessage().then()
        }
      })
    }
  }, [
    clearPendingMessage,
    conversationId,
    createMessageMutation,
    getAccessTokenSilently,
    queryClient,
    queryKey
  ])

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
