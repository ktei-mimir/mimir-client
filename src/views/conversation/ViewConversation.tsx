import {
  CreateMessageRequest,
  ListMessagesResponse,
  Message,
  createMessage,
  listMessages
} from '@/api/messageApi'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import usePendingMessage from '@/components/conversation/conversationStore'
import dateUtils from '@/helpers/dateUtils'
import { buildConnection } from '@/helpers/signalRConnectionFactory'
import { randomUUID } from '@/helpers/stringUtils'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import { useAuth0 } from '@auth0/auth0-react'
import * as signalR from '@microsoft/signalr'
import produce from 'immer'
import { useCallback, useEffect, useRef } from 'react'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import Spinner from '@/components/common/Spinner'
import { handleApiError } from '@/helpers/apiErrorHandler'
import useAppState from '@/store/appStateStore'

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

  const { setError } = useGlobalAlertActionsContext()

  const queryClient = useQueryClient()

  const authenticatedApi = useAuthenticatedApi()

  const queryKey = `conversation/${conversationId}/messages`
  const fetchMessages: QueryFunction<ListMessagesResponse> = async () => {
    return await listMessages(authenticatedApi, conversationId)
  }

  const { data, isLoading, isSuccess, isError, error } = useQuery(
    queryKey,
    fetchMessages,
    {
      onSuccess: () => {
        setError()
      },
      onError: () => {
        handleApiError(
          error,
          setError,
          'There was a problem loading the conversation. Please try again later.'
        )
      }
    }
  )

  const createMessageMutation = useMutation(
    'createMessage',
    (request: CreateMessageRequest) => createMessage(authenticatedApi, request),
    {
      onMutate: async (request: CreateMessageRequest) => {
        setError()
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
        handleApiError(
          err,
          setError,
          'There was a problem with processing your message. Please try again later.'
        )
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
    createMessageMutation.mutate({
      streamId: randomUUID(),
      conversationId: conversationId,
      content: message
    })
  }

  const { pendingMessage, clearPendingMessage } = usePendingMessage()
  const currentPendingMessage = useRef(pendingMessage)

  const { getAccessTokenSilently } = useAuth0()

  const handleStreamMessage = useCallback(
    (m: StreamMessageRequest) => {
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
    },
    [conversationId, queryClient, queryKey]
  )

  const { setSelectedConversationId } = useAppState()

  useEffect(() => {
    setSelectedConversationId(conversationId)
    const messageToCreate = currentPendingMessage.current
    currentPendingMessage.current = ''

    async function sendPendingMessage() {
      if (!conversationId) return
      if (messageToCreate.trim().length > 0) {
        clearPendingMessage()
        if (!hubConnection.current || !hubConnection.current.connectionId)
          return
        createMessageMutation.mutate({
          streamId: randomUUID(),
          conversationId: conversationId,
          content: messageToCreate
        })
      }
    }

    if (hubConnection.current) {
      hubConnection.current.on('StreamMessage', handleStreamMessage)
    }

    if (!hubConnection.current) {
      const connection = buildConnection(getAccessTokenSilently)
      hubConnection.current = connection
      connection.start().then(() => {
        if (connection.state === signalR.HubConnectionState.Connected) {
          sendPendingMessage().then()
        }
      })
    }

    return () => {
      if (hubConnection.current) {
        hubConnection.current.off('StreamMessage', handleStreamMessage)
      }
    }
  }, [
    clearPendingMessage,
    conversationId,
    createMessageMutation,
    getAccessTokenSilently,
    handleStreamMessage,
    queryClient,
    queryKey,
    setSelectedConversationId
  ])

  return (
    <>
      <div className="flex w-full flex-col overflow-auto pb-28">
        {isLoading && !isError ? (
          <Spinner className="mt-5 self-center" />
        ) : null}
        {isSuccess ? renderMessages(data) : null}
      </div>
      <UserInput
        onSubmit={handleMessageSubmit}
        isBusy={createMessageMutation.isLoading}
      />
    </>
  )
}

function renderMessages(data: ListMessagesResponse | undefined) {
  if (data === undefined) return null
  if (data.items.length === 0)
    return (
      <div className="flex flex-col px-5">
        <div
          className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-4 text-center text-sm text-gray-600"
          role="alert"
        >
          No messages found for current conversation
        </div>
        <Link
          to="/conversation"
          type="button"
          className="mt-5 inline-flex
          w-full
           items-center justify-center gap-2 self-center rounded-md border border-transparent bg-indigo-500
            px-4 py-3 text-sm font-semibold text-white
            transition-all
            hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-48"
        >
          Create new conversation
        </Link>
      </div>
    )
  return (
    <ul className="">
      {(data?.items ?? []).map((message: Message) => (
        <ChatMessage
          key={`${message.role}:${message.createdAt}`}
          text={message.content}
          role={message.role}
        />
      ))}
    </ul>
  )
}

export default ViewConversation
