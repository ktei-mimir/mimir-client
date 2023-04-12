import { DEVELOPMENT_BASE_URL } from '@/constants'
import * as signalR from '@microsoft/signalr'

export const buildConnection = (
  accessTokenFactory: () => string | Promise<string>
) => {
  const baseURL =
    process.env.NODE_ENV === 'development'
      ? DEVELOPMENT_BASE_URL
      : process.env.SIGNALR_BASE_URL
  return new signalR.HubConnectionBuilder()
    .withUrl(`${baseURL}/hubs/conversation`, {
      accessTokenFactory
    })
    .build()
}
