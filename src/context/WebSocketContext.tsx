import { contextFactory } from '@/helpers/contextFactory'

import { ReactNode, useCallback, useMemo } from 'react'
import useWebSocket from 'react-use-websocket'
import { useAuth0 } from '@auth0/auth0-react'
import logger from '@/helpers/logger'
import mitt, { Emitter } from 'mitt'

type Props = {
  children?: ReactNode
}

export type OnMessageEvent = {
  onMessage: MessageEvent
}

type WebSocketValues = {
  emitter: Emitter<OnMessageEvent>
}

const [useWebSocketContext, WebSocketContext] =
  contextFactory<WebSocketValues>()

export { useWebSocketContext }

const WebSocketContextProvider = (props: Props) => {
  const { children } = props
  const emitter = mitt<OnMessageEvent>()
  const { getAccessTokenSilently } = useAuth0()

  const getSocketUrl = useCallback(async () => {
    const token = await getAccessTokenSilently()
    return `wss://mimir-chat-socket.disasterdev.net/prod/?token=${token}`
  }, [getAccessTokenSilently])

  useWebSocket(getSocketUrl, {
    share: true,
    onMessage: event => {
      emitter.emit('onMessage', event)
    },
    onOpen: () => {
      logger.info('websocket connected')
    },
    onClose: () => {
      logger.info('websocket disconnected')
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a
    // reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and
    // then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: attemptNumber =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
  })

  const values = useMemo(() => ({ emitter }), [emitter])
  return (
    <WebSocketContext.Provider value={values ?? { emitter }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContextProvider
