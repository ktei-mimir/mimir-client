import logoUrl from '@/assets/yggdrasil.png'
import UserInput from '@/components/conversation/UserInput'
import { useMutation, useQueryClient } from 'react-query'
import { createConversation } from '@/api/conversationApi'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import { useNavigate } from 'react-router-dom'
import usePendingMessage from '@/components/conversation/conversationStore'
import { useGlobalAlertActionsContext } from '@/context/GlobalAlertContext'
import { handleApiError } from '@/helpers/apiErrorHandler'
import { useState } from 'react'

const NewConversation = () => {
  const queryClient = useQueryClient()
  const authenticatedApi = useAuthenticatedApi()
  const createConversationMutation = useMutation((message: string) =>
    createConversation(authenticatedApi, {
      message
    })
  )

  const navigate = useNavigate()

  const { setPendingMessage } = usePendingMessage()
  const { setError } = useGlobalAlertActionsContext()
  const [isSendingMessage, setIsSendingMessage] = useState(false)

  const handleMessageSubmit = async (message: string) => {
    setIsSendingMessage(true)
    setError(undefined)
    await createConversationMutation.mutate(message, {
      onError: error => {
        handleApiError(error, setError)
      },
      onSuccess: response => {
        queryClient.invalidateQueries('conversations')
        setPendingMessage(message)
        navigate(`/conversation/${response.data.id}`)
      },
      onSettled: () => {
        setIsSendingMessage(false)
      }
    })
  }

  return (
    <>
      <div className="flex h-full w-full flex-col justify-center overflow-auto pb-28">
        <div className="flex h-full flex-1 flex-col justify-center gap-4">
          <h1 className="text-center text-4xl font-medium">Mimir</h1>
          <img src={logoUrl} alt="Yggdrasil" className="mx-auto w-48" />
          <p className="text-center text-xl italic">
            Hello mortal, I have knowledge, so ask me anything...
          </p>
        </div>
      </div>
      <UserInput onSubmit={handleMessageSubmit} isBusy={isSendingMessage} />
    </>
  )
}

export default NewConversation
