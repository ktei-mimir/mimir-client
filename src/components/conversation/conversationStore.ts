import { atom, useAtom } from 'jotai'

const pendingMessageAtom = atom('')

function usePendingMessage() {
  const [pendingMessage, setPendingMessage] = useAtom(pendingMessageAtom)

  function clearPendingMessage() {
    setPendingMessage('')
  }

  function setNewPendingMessage(message: string) {
    setPendingMessage(message)
  }

  return {
    pendingMessage,
    setPendingMessage: setNewPendingMessage,
    clearPendingMessage
  }
}

export default usePendingMessage
