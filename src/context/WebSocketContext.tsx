import { contextFactory } from '@/helpers/contextFactory'

import { ReactNode, useCallback, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { useAuth0 } from '@auth0/auth0-react'
import { WebSocketLike } from 'react-use-websocket/dist/lib/types'
import logger from '@/helpers/logger'

type Props = {
  children?: ReactNode
}

type WebSocketValues = {
  getSocket: () => WebSocketLike | null
}

const [useWebSocketContext, WebSocketContext] =
  contextFactory<WebSocketValues>()

export { useWebSocketContext }

const WebSocketContextProvider = (props: Props) => {
  const { children } = props
  const [state, setState] = useState<WebSocketValues>({ getSocket: () => null })
  const { getAccessTokenSilently } = useAuth0()

  const getSocketUrl = useCallback(async () => {
    const token = await getAccessTokenSilently()
    return `wss://mimir-chat-socket.disasterdev.net/prod/?token=${token}`
  }, [getAccessTokenSilently])

  const { getWebSocket } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      logger.info('websocket connected')
      setState({
        getSocket: getWebSocket
      })
    },
    onClose: () => {
      logger.info('websocket disconnected')
      // setState({
      //   socket: () => null
      // })
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a
    // reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and
    // then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: attemptNumber =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
  })

  const values = useMemo(() => state ?? {}, [state])
  return (
    <WebSocketContext.Provider value={values ?? {}}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContextProvider
