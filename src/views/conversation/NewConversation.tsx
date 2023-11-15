import { createConversation } from '@/api/conversationApi'
import Logo from '@/components/common/Logo'
import UserInput from '@/components/conversation/UserInput'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import useAppState from '@/store/appStateStore'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { createMessage } from '@/api/messageApi'
import { randomUUID } from '@/helpers/stringUtils'
import { useWebSocketContext } from '@/context/WebSocketContext'

const NewConversation = () => {
  const queryClient = useQueryClient()
  const authenticatedApi = useAuthenticatedApi()
  const createConversationMutation = useMutation((message: string) =>
    createConversation(authenticatedApi, {
      message
    })
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

  return (
    <>
      <div className="flex h-full w-full flex-col justify-center overflow-auto pb-28">
        <div className="flex h-full flex-1 flex-col justify-center gap-4">
          <h1 className="text-center text-4xl font-medium text-zinc-300">
            Mimir
          </h1>
          <Logo />
          <p className="text-center text-xl font-extralight italic text-zinc-300">
            Hello mortal, I have knowledge, so ask me anything...
          </p>
        </div>
      </div>
      <UserInput onSubmit={handleMessageSubmit} isBusy={isBusy} />
    </>
  )
}

export default NewConversation
