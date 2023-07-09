import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

const pendingMessageAtom = atom('')

function usePendingMessage() {
  const [pendingMessage, setPendingMessage] = useAtom(pendingMessageAtom)

  const clearPendingMessage = useCallback(() => {
    setPendingMessage('')
  }, [setPendingMessage])

  return {
    pendingMessage,
    setPendingMessage,
    clearPendingMessage
  }
}

export default usePendingMessage
