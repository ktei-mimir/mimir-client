import { createConversation } from '@/api/conversationApi'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useAppState from '@/store/appStateStore'
import React, {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createMessage } from '@/api/messageApi'
import { randomUUID } from '@/helpers/stringUtils'
import { useWebSocketContext } from '@/context/WebSocketContext'
import { listPrompts, ListPromptsResponse } from '@/api/promptApi'
import Button from '@/components/common/Button'
import Spinner from '@/components/common/Spinner'
import TextArea from '@/components/common/TextArea'
import produce from 'immer'
import classNames from 'classnames'

type FormData = {
  message: string
}

function updateField(state: FormData, name: keyof FormData, value: string) {
  return produce(state, draft => {
    draft[name] = value
  })
}

const NewConversation = () => {
  const queryClient = useQueryClient()
  const authenticatedApi = useAuthenticatedApi()
  const { mutateAsync: createConversationAsync } = useMutation(
    (message: string) =>
      createConversation(authenticatedApi, {
        message
      })
  )

  const fetchPrompts: QueryFunction<ListPromptsResponse> = async () => {
    return await listPrompts(authenticatedApi)
  }

  const { data: prompts, isLoading: isLoadingPrompts } = useQuery(
    '/prompts',
    fetchPrompts
  )

  const navigate = useNavigate()

  const { setError } = useGlobalAlertActionsContext()

  const { setSelectedConversationId } = useAppState()
  const [isBusy, setIsBusy] = useState(false)
  const { connectionId } = useWebSocketContext()

  const submitMessage = useCallback(
    async (message: string) => {
      setError(undefined)
      setIsBusy(true)
      await createConversationAsync(message, {
        onError: error => {
          handleApiError(error, setError)
          setIsBusy(false)
        },
        onSuccess: async response => {
          await queryClient.invalidateQueries('conversations')
          await createMessage(authenticatedApi, {
            streamId: randomUUID(),
            conversationId: response.data.id,
            content: message,
            connectionId
          })
          setIsBusy(false)
          navigate(`/conversation/${response.data.id}`)
        }
      })
    },
    [
      authenticatedApi,
      connectionId,
      createConversationAsync,
      navigate,
      queryClient,
      setError
    ]
  )

  useEffect(() => {
    setSelectedConversationId(undefined)
  }, [setSelectedConversationId])

  const [searchParams] = useSearchParams()
  const promptId = searchParams.get('promptId')

  const prompt = useMemo(
    () => prompts?.items.find(p => p.id === promptId),
    [prompts, promptId]
  )

  const [form, setForm] = useState<FormData>({
    message: ''
  })

  const handleTextAreaChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (e.target.name !== 'message') return
      setForm(updateField(form, e.target.name, e.target.value))
    },
    [form, setForm]
  )

  const promptEnhancedMessage = useMemo(() => {
    return !prompt
      ? form.message
      : `${prompt.text.replace(`\${INPUT}`, form.message)}`
  }, [form.message, prompt])

  const { message } = form

  const handleFormSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!message.trim()) return
      await submitMessage(promptEnhancedMessage)
    },
    [message, submitMessage, promptEnhancedMessage]
  )

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault()
        if (!message.trim()) return
        await submitMessage(promptEnhancedMessage)
      }
    },
    [message, promptEnhancedMessage, submitMessage]
  )

  return (
    <div
      className={classNames(
        'flex h-full w-full justify-center overflow-auto px-2 pb-28'
      )}
    >
      <div className="flex h-full flex-1 flex-col justify-center gap-4">
        <Link to="/">
          <h1 className="pt-4 text-center text-4xl font-medium text-gray-950 dark:text-zinc-300">
            Mimir
          </h1>
        </Link>

        {/*  <Logo />*/}
        {/*  <p className="text-center text-xl font-extralight italic text-gray-950 dark:text-zinc-300">*/}
        {/*    Hello mortal, I have knowledge, so ask me anything...*/}
        {/*  </p>*/}
        {/*</div>*/}
        <>
          {isLoadingPrompts ? (
            <div className="flex w-full justify-center">
              <Spinner />
            </div>
          ) : null}
          <div className="flex flex-col overflow-auto">
            {prompt ? (
              <h5 className="text-lg dark:text-zinc-300">{prompt.title}</h5>
            ) : null}
            <form className="mt-2 w-full" onSubmit={handleFormSubmit}>
              <TextArea
                className="h-96 max-h-96 w-full md:h-96"
                value={message}
                onChange={handleTextAreaChange}
                onKeyDown={handleKeyDown}
                name="message"
                placeholder="Your input..."
              />
              <div className="flex items-center justify-between">
                <Button type="submit" isLoading={isBusy}>
                  Ask Mimir
                </Button>
                <Link
                  to="/"
                  className="inline-block align-baseline text-sm font-bold text-gray-900 hover:text-black dark:text-gray-500 dark:hover:text-gray-600"
                >
                  Cancel
                </Link>
              </div>
            </form>
            {prompt ? (
              <div className="mt-2 bg-gray-100 p-2 text-sm text-gray-700 dark:bg-gray-500">
                <p className="font-bold">Preview of your question</p>
                <p className="whitespace-pre-wrap">{promptEnhancedMessage}</p>
              </div>
            ) : null}
          </div>
        </>
      </div>
    </div>
  )
}

export default NewConversation
