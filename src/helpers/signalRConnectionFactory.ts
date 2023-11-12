// import * as signalR from '@microsoft/signalr'

let websocket: WebSocket | null = null

export const buildConnection = async (
  accessTokenFactory: () => string | Promise<string>
) => {
  if (websocket) {
    return websocket
  }
  // const baseURL = import.meta.env.VITE_API_BASE_URL
  const accessToken = await accessTokenFactory()
  const socketURL =
    'wss://9riswt00ti.execute-api.ap-southeast-2.amazonaws.com/prod/'
  websocket = new WebSocket(`${socketURL}?token=${accessToken}`)
  return websocket
  // return new signalR.HubConnectionBuilder()
  //   .withUrl(`${baseURL}/hubs/conversation`, {
  //     accessTokenFactory
  //   })
  //   .build()
}
