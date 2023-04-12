import { AxiosError } from 'axios'

export const handleApiError = (
  error: unknown,
  setError: (message?: string) => void,
  message?: string
) => {
  if (error instanceof AxiosError && error.response) {
    if (error.response.status >= 400 && error.response.status < 500) {
      setError(error.response.data as string)
    } else {
      setError(error.message)
    }
  } else {
    setError(message ?? 'Something went wrong. Please try again later.')
  }
}
