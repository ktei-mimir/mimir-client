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
import usePendingMessage from '@/components/conversation/conversationStore'
import { useEffect, useRef } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuth0 } from '@auth0/auth0-react'

type HubMessage = {
  conversationId: string
  role: string
  content: string
}

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
                  createdAt: dateUtils.getUtcNowTicks()
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

  const hubConnection = useRef<signalR.HubConnection | undefined>()

  const handleMessageSubmit = async (message: string) => {
    if (!conversationId) {
      return
    }
    if (!hubConnection.current || !hubConnection.current.connectionId) {
      return
    }
    await createMessageMutation.mutate({
      connectionId: hubConnection.current.connectionId,
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
    async function sendPendingMessage(connectionId: string) {
      if (!conversationId) return
      if (messageToCreate.trim().length > 0) {
        clearPendingMessage()
        await createMessageMutation.mutate({
          connectionId,
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
        console.log(m.content)
      })
      hubConnection.current = connection
      connection.start().then(() => {
        console.log('Connected: ', connection.connectionId)
        if (connection.connectionId) {
          sendPendingMessage(connection.connectionId).then()
        }
      })
    }
  }, [
    clearPendingMessage,
    conversationId,
    createMessageMutation,
    getAccessTokenSilently
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
