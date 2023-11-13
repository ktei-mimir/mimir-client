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
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import dateUtils from '@/helpers/dateUtils'
import { randomUUID } from '@/helpers/stringUtils'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useAppState from '@/store/appStateStore'
import produce from 'immer'
import { useCallback, useEffect, useRef } from 'react'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { useWebSocketContext } from '@/context/WebSocketContext'
import logger from '@/helpers/logger'

type StreamMessageRequest = {
  streamId: string
  conversationId: string
  content?: string
  stop?: boolean
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
  content?: string,
  stop?: boolean
) =>
  produce(conversation, draft => {
    const messageToStream = draft.items.find(m => m.streamId === streamId)
    if (!messageToStream) {
      return
    }
    if (stop) {
      delete messageToStream.streamId
      return
    } else if (content) {
      messageToStream.content = content
    }
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
          // setIsBusy(false)
        }
      }
    )

  const handleMessageSubmit = async (message: string) => {
    await createMessageAsync({
      streamId: randomUUID(),
      conversationId: conversationId,
      content: message
    })
  }

  const { socket } = useWebSocketContext()

  const handleStreamMessage = useCallback(
    (m: StreamMessageRequest) => {
      if (m.conversationId !== conversationId) {
        logger.warn(
          {
            conversationId: m.conversationId,
            expectedConversationId: conversationId
          },
          'ConversationId not matched'
        )
        return
      }
      let currentConversation =
        queryClient.getQueryData<ListMessagesResponse>(queryKey)
      if (!currentConversation) {
        logger.warn({ queryKey }, 'No current conversation found')
        return
      }

      currentConversation = streamMessage(
        currentConversation,
        m.streamId,
        m.content,
        m.stop
      )
      queryClient.setQueryData(queryKey, currentConversation)
      scrollToBottom()
    },
    [conversationId, queryClient, queryKey]
  )

  const handlePauseStream = useCallback(
    (streamId: string) => {
      let currentConversation =
        queryClient.getQueryData<ListMessagesResponse>(queryKey)
      if (!currentConversation) {
        return
      }
      currentConversation = streamMessage(
        currentConversation,
        streamId,
        undefined,
        true
      )
      queryClient.setQueryData(queryKey, currentConversation)
    },
    [queryClient, queryKey]
  )

  const { setSelectedConversationId } = useAppState()

  const handleSocketMessage = useCallback(
    (e: Event) => {
      const m: StreamMessageRequest = JSON.parse((e as MessageEvent).data)
      logger.debug(m, 'Received message from socket')
      handleStreamMessage(m)
    },
    [handleStreamMessage]
  )

  useEffect(() => {
    if (!socket) return
    socket.addEventListener('message', handleSocketMessage)
    logger.info('listener handleSocketMessage attached')

    return () => {
      logger.info('listener handleSocketMessage detached')
      socket?.removeEventListener('message', handleSocketMessage)
    }
  }, [handleSocketMessage, socket])

  useEffect(() => {
    setSelectedConversationId(conversationId)

    scrollToBottom()
  }, [conversationId, setSelectedConversationId])

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
        {isSuccess ? renderMessages(data, handlePauseStream) : null}
        <div ref={messagesEndRef}></div>
      </div>
      <UserInput onSubmit={handleMessageSubmit} isBusy={isCreatingMessage} />
    </>
  )
}

function renderMessages(
  data: ListMessagesResponse | undefined,
  handlePauseStream?: (streamId: string) => void
) {
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
          isStreaming={!!message.streamId}
          streamId={message.streamId}
          onPause={handlePauseStream}
        />
      ))}
    </ul>
  )
}

export default ViewConversation
