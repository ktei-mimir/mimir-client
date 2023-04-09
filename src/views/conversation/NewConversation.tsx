import logoUrl from '@/assets/yggdrasil.png'
import UserInput from '@/components/conversation/UserInput'
import { useMutation, useQueryClient } from 'react-query'
import { createConversation } from '@/api/conversationApi'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import { useNavigate } from 'react-router-dom'
import usePendingMessage from '@/components/conversation/conversationStore'

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

  const handleMessageSubmit = async (message: string) => {
    await createConversationMutation.mutate(message, {
      onSuccess: response => {
        queryClient.invalidateQueries('conversations')
        setPendingMessage(message)
        navigate(`/conversation/${response.data.id}`)
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
      <UserInput onSubmit={handleMessageSubmit} />
    </>
  )
}

export default NewConversation
