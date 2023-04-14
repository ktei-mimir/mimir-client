import * as signalR from '@microsoft/signalr'

export const buildConnection = (
  accessTokenFactory: () => string | Promise<string>
) => {
  const baseURL = import.meta.env.VITE_API_BASE_URL
  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseURL}/hubs/conversation`, {
      accessTokenFactory
    })
    .build()
}
