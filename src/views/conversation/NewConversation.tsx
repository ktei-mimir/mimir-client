import { createConversation } from '@/api/conversationApi'
import UserInput from '@/components/conversation/UserInput'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useAppState from '@/store/appStateStore'
import { useCallback, useEffect, useState } from 'react'
import {
  QueryFunction,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createMessage } from '@/api/messageApi'
import { randomUUID } from '@/helpers/stringUtils'
import { useWebSocketContext } from '@/context/WebSocketContext'
import PromptCard from '@/components/prompt/PromptCard'
import { listPrompts, ListPromptsResponse } from '@/api/promptApi'
import Button from '@/components/common/Button'

const NewConversation = () => {
  const queryClient = useQueryClient()
  const authenticatedApi = useAuthenticatedApi()
  const createConversationMutation = useMutation((message: string) =>
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

  const handleMessageSubmit = async (message: string) => {
    setError(undefined)
    setIsBusy(true)
    await createConversationMutation.mutateAsync(message, {
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
  }

  useEffect(() => {
    setSelectedConversationId(undefined)
  }, [setSelectedConversationId])

  const handleCreatePrompt = useCallback(() => {
    navigate('/prompt')
  }, [navigate])

  return (
    <>
      <div className="flex h-full w-full justify-center overflow-auto pb-28">
        <div className="flex h-full flex-1 flex-col justify-center gap-4">
          <h1 className="text-center text-4xl font-medium text-gray-950 dark:text-zinc-300">
            Mimir
          </h1>
          {/*  <Logo />*/}
          {/*  <p className="text-center text-xl font-extralight italic text-gray-950 dark:text-zinc-300">*/}
          {/*    Hello mortal, I have knowledge, so ask me anything...*/}
          {/*  </p>*/}
          {/*</div>*/}

          <Button
            className="w-full self-center sm:w-64"
            onClick={handleCreatePrompt}
          >
            Create a prompt
          </Button>

          <div className="grid grid-flow-row auto-rows-max overflow-auto sm:grid-cols-2 sm:gap-2 lg:grid-cols-3 lg:gap-2">
            {!isLoadingPrompts && prompts ? (
              <>
                {prompts.items.map(prompt => (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    className="mt-2"
                  />
                ))}
              </>
            ) : null}
          </div>
        </div>
      </div>
      <UserInput onSubmit={handleMessageSubmit} isBusy={isBusy} />
    </>
  )
}

export default NewConversation
