import {
  ListMessagesResponse,
  Message,
  CreateMessageRequest,
  createMessage
} from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import dateUtils from '@/helpers/dateUtils'
import usePendingMessage from '@/components/conversation/conversationStore'
import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuth0 } from '@auth0/auth0-react'
import useMessages from '@/views/conversation/useMessages'
import { v4 as uuidv4 } from 'uuid'
import produce from 'immer'

type HubMessage = {
  streamId: string
  conversationId: string
  role: string
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
      streamId: uuidv4(),
      conversationId: conversationId,
      content: message
    })
  }

  const { pendingMessage, clearPendingMessage } = usePendingMessage()
  const currentPendingMessage = useRef(pendingMessage)

  // useEffect(() => {
  //   const messageToCreate = currentPendingMessage.current
  //   currentPendingMessage.current = ''
  //   async function sendPendingMessage() {
  //     if (!conversationId) return
  //     if (messageToCreate.trim().length > 0) {
  //       clearPendingMessage()
  //       await createMessageMutation.mutate({
  //         connectionId:
  //         conversationId: conversationId,
  //         content: messageToCreate
  //       })
  //     }
  //   }
  //
  //   sendPendingMessage().then()
  // }, [
  //   clearPendingMessage,
  //   conversationId,
  //   createMessageMutation,
  //   pendingMessage
  // ])

  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    const messageToCreate = currentPendingMessage.current
    currentPendingMessage.current = ''
    async function sendPendingMessage() {
      if (!conversationId) return
      if (messageToCreate.trim().length > 0) {
        clearPendingMessage()
        await createMessageMutation.mutate({
          streamId: uuidv4(),
          conversationId: conversationId,
          content: messageToCreate
        })
      }
    }

    if (!hubConnection.current) {
      console.log('connecting...')
      const connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hubs/conversation', {
          accessTokenFactory(): string | Promise<string> {
            return getAccessTokenSilently()
          }
        })
        .build()
      connection.on('ReceiveMessage', (m: HubMessage) => {
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
        console.log('Connected: ', connection.connectionId)
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
