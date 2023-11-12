import { contextFactory } from '@/helpers/contextFactory'

import { ReactNode, useEffect, useMemo, useState } from 'react'
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
  const [socketUrl, setSocketUrl] = useState<string>(
    'wss://9riswt00ti.execute-api.ap-southeast-2.amazonaws.com/prod/'
  )

  const { getAccessTokenSilently } = useAuth0()

  const { getWebSocket } = useWebSocket(socketUrl)

  // const handleSocketOpen = useCallback(() => {
  //   console.log('socket opened')
  // }, [])

  useEffect(() => {
    getAccessTokenSilently().then(token => {
      const socketURL = `wss://9riswt00ti.execute-api.ap-southeast-2.amazonaws.com/prod/?token=${token}`
      setSocketUrl(socketURL)
      // const ws = new WebSocket(`${socketURL}?token=${token}`)
      setState({
        socket: getWebSocket()
      })
    })

    // Close ws connection when component unmounts
    // return () => {
    //   state.socket?.close()
    // }
  }, [getAccessTokenSilently, getWebSocket, socketUrl])

  const values = useMemo(() => state ?? {}, [state])
  return (
    <WebSocketContext.Provider value={values ?? {}}>
      {children}
    </WebSocketContext.Provider>
  )
}

export default WebSocketContextProvider
