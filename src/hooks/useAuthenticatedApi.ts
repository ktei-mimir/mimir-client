import { useAuth0 } from '@auth0/auth0-react'
import { AxiosRequestConfig, AxiosResponse } from 'axios'
import api, { ApiRequest } from '@/api/api'

type AxiosRequestConfigurator = (cfg: AxiosRequestConfig) => void

function buildAxiosRequestConfig(
  token: string,
  config?: AxiosRequestConfigurator
) {
  const requestConfig: AxiosRequestConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
  config?.(requestConfig)
  return requestConfig
}

export type AuthenticatedApi = ReturnType<typeof useAuthenticatedApi>

const useAuthenticatedApi = () => {
  const { getAccessTokenSilently } = useAuth0()

  const makeApiRequest = async <T>(
    apiFunction: (request: ApiRequest) => Promise<AxiosResponse<T>>,
    url: string,
    body?: unknown,
    config?: AxiosRequestConfigurator
  ): Promise<AxiosResponse<T>> => {
    const accessToken = await getAccessTokenSilently()
    const requestConfig = buildAxiosRequestConfig(accessToken, config)
    return await apiFunction({ url, body, config: requestConfig })
  }

  return {
    get: async <T>(url: string, config?: AxiosRequestConfigurator) =>
      makeApiRequest<T>(api.get, url, undefined, config),
    delete: async <T>(url: string, config?: AxiosRequestConfigurator) =>
      makeApiRequest<T>(api.delete, url, undefined, config),
    post: async <T>(
      url: string,
      body: unknown,
      config?: AxiosRequestConfigurator
    ) => makeApiRequest<T>(api.post, url, body, config),
    put: async <T>(
      url: string,
      body: unknown,
      config?: AxiosRequestConfigurator
    ) => makeApiRequest<T>(api.put, url, body, config)
  }
}

export default useAuthenticatedApi
