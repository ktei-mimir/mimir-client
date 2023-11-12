import { contextFactory } from '@/helpers/contextFactory'

import { ReactNode, useCallback, useMemo, useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { useAuth0 } from '@auth0/auth0-react'
import { WebSocketLike } from 'react-use-websocket/dist/lib/types'

type Props = {
  children?: ReactNode
}

type WebSocketValues = {
  socket: WebSocketLike | null
}

const [useWebSocketContext, WebSocketContext] =
  contextFactory<WebSocketValues>()

export { useWebSocketContext }

const WebSocketContextProvider = (props: Props) => {
  const { children } = props
  const [state, setState] = useState<WebSocketValues>({ socket: null })
  // const [socketUrl, setSocketUrl] = useState<string>(
  //   'wss://9riswt00ti.execute-api.ap-southeast-2.amazonaws.com/prod/'
  // )

  const { getAccessTokenSilently } = useAuth0()

  // In functional React component
  const getSocketUrl = useCallback(async () => {
    const token = await getAccessTokenSilently()
    return `wss://mimir-chat-socket.disasterdev.net/prod/?token=${token}`
  }, [getAccessTokenSilently])

  const { getWebSocket } = useWebSocket(getSocketUrl, {
    onOpen: () => {
      console.log('websocket connected')
      setState({
        socket: getWebSocket()
      })
    },
    shouldReconnect: () => true,
    reconnectAttempts: 10,
    //attemptNumber will be 0 the first time it attempts to reconnect, so this equation results in a reconnect pattern of 1 second, 2 seconds, 4 seconds, 8 seconds, and then caps at 10 seconds until the maximum number of attempts is reached
    reconnectInterval: attemptNumber =>
      Math.min(Math.pow(2, attemptNumber) * 1000, 10000)
  })

  // const handleSocketOpen = useCallback(() => {
  //   console.log('socket opened')
  // }, [])

  // useEffect(() => {
  //   setState({
  //     socket: getWebSocket()
  //   })
  // }, [getWebSocket])
  //
  //   // Close ws connection when component unmounts
  //   // return () => {
  //   //   state.socket?.close()
  //   // }
  // }, [getAccessTokenSilently, getWebSocket, socketUrl])

  const values = useMemo(() => state ?? {}, [state])
  return (
    <WebSocketContext.Provider value={values ?? {}}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContextProvider
