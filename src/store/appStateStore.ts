import { atom, useAtom } from 'jotai'

const selectedConversationIdAtom = atom<string | undefined>(undefined)

function useAppState() {
  const [selectedConversationId, setSelectedConversationId] = useAtom(
    selectedConversationIdAtom
  )

  return {
    selectedConversationId,
    setSelectedConversationId
  }
}

export default useAppState
