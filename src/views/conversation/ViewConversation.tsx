import {
  CreateMessageRequest,
  ListMessagesResponse,
  Message,
  createMessage,
  listMessages
} from '@/api/messageApi'
import Spinner from '@/components/common/Spinner'
import ChatMessage from '@/components/conversation/ChatMessage'
import UserInput from '@/components/conversation/UserInput'
import usePendingMessage from '@/components/conversation/conversationStore'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import dateUtils from '@/helpers/dateUtils'
import { buildConnection } from '@/helpers/signalRConnectionFactory'
import { randomUUID } from '@/helpers/stringUtils'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useAppState from '@/store/appStateStore'
import { useAuth0 } from '@auth0/auth0-react'
import * as signalR from '@microsoft/signalr'
import produce from 'immer'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import { Link, useParams } from 'react-router-dom'

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

  const { mutateAsync: createMessageAsync, isLoading: isCreatingMessage } =
    useMutation(
      'createMessage',
      (request: CreateMessageRequest) =>
        createMessage(authenticatedApi, request),
      {
        onMutate: async (request: CreateMessageRequest) => {
          setError()
          await queryClient.cancelQueries(queryKey)

          return queryClient.setQueryData<ListMessagesResponse>(
            queryKey,
            oldData => {
              const userMessage: Message = {
                content: request.content,
                role: 'user',
                createdAt: dateUtils.getUtcNowTicks()
              }
              const assistantMessage: Message = {
                streamId: request.streamId,
                role: 'assistant',

                // force the assistant message to be after the user message
                createdAt: dateUtils.getUtcNowTicks() + 1
              }
              return appendMessages(
                oldData ?? { items: [] },
                userMessage,
                assistantMessage
              )
            }
          )
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

  const [hubConnection, setHubConnection] = useState<signalR.HubConnection>()

  const handleMessageSubmit = async (message: string) => {
    await createMessageAsync({
      streamId: randomUUID(),
      conversationId: conversationId,
      content: message
    })
  }

  const { pendingMessage, clearPendingMessage } = usePendingMessage()

  const { getAccessTokenSilently } = useAuth0()

  const handleStreamMessage = useCallback(
    (m: StreamMessageRequest) => {
      if (m.conversationId !== conversationId) {
        console.warn(
          'ConversationId not matched',
          m.conversationId,
          conversationId
        )
        return
      }
      let currentConversation =
        queryClient.getQueryData<ListMessagesResponse>(queryKey)
      if (!currentConversation) {
        console.warn('No current conversation found', conversationId)
        return
      }

      currentConversation = streamMessage(
        currentConversation,
        m.streamId,
        m.content
      )
      queryClient.setQueryData(queryKey, currentConversation)
      scrollToBottom()
    },
    [conversationId, queryClient, queryKey]
  )

  const { setSelectedConversationId } = useAppState()

  useEffect(() => {
    setHubConnection(buildConnection(getAccessTokenSilently))
  }, [getAccessTokenSilently])

  useEffect(() => {
    setSelectedConversationId(conversationId)

    async function sendPendingMessage() {
      if (!conversationId) return
      const messageToCreate = pendingMessage.trim()
      if (pendingMessage.length === 0) {
        return
      }
      clearPendingMessage()
      await createMessageAsync({
        streamId: randomUUID(),
        conversationId: conversationId,
        content: messageToCreate
      })
    }

    if (hubConnection) {
      hubConnection.on('StreamMessage', handleStreamMessage)
      if (hubConnection.state !== signalR.HubConnectionState.Connected) {
        hubConnection.start().then(() => {
          if (hubConnection.state === signalR.HubConnectionState.Connected) {
            sendPendingMessage().catch(console.error)
          }
        })
      }
    }

    scrollToBottom()

    return () => {
      hubConnection?.off('StreamMessage', handleStreamMessage)
    }
  }, [
    clearPendingMessage,
    conversationId,
    createMessageAsync,
    getAccessTokenSilently,
    handleStreamMessage,
    queryClient,
    queryKey,
    setSelectedConversationId,
    hubConnection,
    pendingMessage
  ])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="flex w-full flex-col overflow-auto pb-28">
        {isLoading && !isError ? (
          <Spinner className="mt-5 self-center" />
        ) : null}
        {isSuccess ? renderMessages(data) : null}
        <div ref={messagesEndRef}></div>
      </div>
      <UserInput onSubmit={handleMessageSubmit} isBusy={isCreatingMessage} />
    </>
  )
}

function renderMessages(data: ListMessagesResponse | undefined) {
  if (data === undefined) return null
  if (data.items.length === 0)
    return (
      <div className="flex flex-col px-5">
        <div
          className="mt-5 bg-zinc-700 p-4 text-center text-sm text-gray-200"
          role="alert"
        >
          No messages found for current conversation
        </div>
        <Link
          to="/conversation"
          type="button"
          className="mt-5 inline-flex
          w-full
           items-center justify-center gap-2 self-center bg-slate-700
            px-4 py-3 text-sm font-semibold text-white
            transition-colors
            hover:bg-slate-800 sm:w-56"
        >
          Create new conversation
        </Link>
        <p className="mt-5 self-center text-gray-500">Or</p>
        <p className="mt-5 self-center text-gray-500">
          Use the text box bottom to send a new message
        </p>
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

export default memo(ViewConversation)
