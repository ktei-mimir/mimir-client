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
import { useParams } from 'react-router-dom'
import logger from '@/helpers/logger'
import {
  emitter,
  SocketMessage,
  useWebSocketContext
} from '@/context/WebSocketContext'

type StreamMessageRequest = {
  streamId: string
  conversationId: string
  chunk?: string
  stop?: boolean
}

const appendMessages = (
  conversation: ListMessagesResponse,
  ...messages: Message[]
) =>
  produce(conversation, draft => {
    messages.forEach(m => draft.items.push(m))
  })

const canRefetch = (d: ListMessagesResponse | undefined) => {
  if (!d) return true
  // make sure no message is streaming
  return d.items?.every(m => !m.isStreaming) === true
}

const streamMessage = (
  messages: ListMessagesResponse,
  streamId: string,
  chunk?: string,
  stop?: boolean
) =>
  produce(messages, draft => {
    const messageToStream = draft.items.find(m => m.streamId === streamId)
    if (!messageToStream) {
      return
    }
    if (stop) {
      delete messageToStream.streamId
      messageToStream.isStreaming = false
      return
    } else if (chunk) {
      messageToStream.content += chunk
      messageToStream.isStreaming = true
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

  const refreshInterval = 5 * 60 * 1000 // ms

  const { data, isLoading, isSuccess, isError, error } = useQuery(
    queryKey,
    fetchMessages,
    {
      refetchInterval: (d: ListMessagesResponse | undefined) => {
        return canRefetch(d) ? refreshInterval : false
      },
      refetchOnWindowFocus: () => {
        return canRefetch(
          queryClient.getQueryData<ListMessagesResponse>(queryKey)
        )
      },
      refetchOnMount: () => {
        return canRefetch(
          queryClient.getQueryData<ListMessagesResponse>(queryKey)
        )
      },
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
        onError: (err, _variables, context?: ListMessagesResponse) => {
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

  const { connectionId } = useWebSocketContext()

  const handleMessageSubmit = async (message: string) => {
    await createMessageAsync({
      streamId: randomUUID(),
      conversationId: conversationId,
      content: message,
      connectionId
    })
  }

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
      let messages = queryClient.getQueryData<ListMessagesResponse>(queryKey)
      if (!messages) {
        logger.warn({ queryKey }, 'No current conversation found')
        return
      }

      messages = streamMessage(messages, m.streamId, m.chunk, m.stop)
      queryClient.setQueryData(queryKey, messages)
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
    (payload: SocketMessage) => {
      if (payload.action !== 'streamCompletion') {
        return
      }
      const m = payload as unknown as StreamMessageRequest
      handleStreamMessage(m)
    },
    [handleStreamMessage]
  )

  useEffect(() => {
    emitter.on('onMessage', handleSocketMessage)
    return () => {
      emitter.off('onMessage', handleSocketMessage)
    }
  }, [handleSocketMessage])

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
  return (
    <ul className="">
      {(data?.items ?? []).map((message: Message) => (
        <ChatMessage
          key={`${message.role}:${message.createdAt}`}
          text={message.content}
          role={message.role}
          isStreaming={message.isStreaming === true}
          streamId={message.streamId}
          onPause={handlePauseStream}
        />
      ))}
    </ul>
  )
}

export default ViewConversation
