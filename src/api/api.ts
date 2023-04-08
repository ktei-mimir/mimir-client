import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// Default config for the axios instance
const axiosParams = {
  // Set different base URL based on the environment
  baseURL:
    process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '/'
}
// Create axios instance with default params
const axiosInstance = axios.create(axiosParams)
// Main api function

export type ApiRequest = {
  url: string
  body?: unknown
  config?: AxiosRequestConfig
}

const api = (axios: AxiosInstance) => {
  return {
    get: <T>(request: ApiRequest) =>
      axios.get<T>(request.url, request.config ?? {}),
    delete: <T>(request: ApiRequest) =>
      axios.delete<T>(request.url, request.config ?? {}),
    post: <T>(request: ApiRequest) =>
      axios.post<T>(request.url, request.body, request.config ?? {}),
    put: <T>(request: ApiRequest) =>
      axios.put<T>(request.url, request.body, request.config ?? {})
  }
}
export default api(axiosInstance)
