import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from '../utils/constants'
import toast from 'react-hot-toast'

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add auth token if available
      const token = localStorage.getItem('auth_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      // Add API key if available
      const apiKey = localStorage.getItem('api_key')
      if (apiKey && config.headers) {
        config.headers['X-API-Key'] = apiKey
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor
  client.interceptors.response.use(
    (response) => {
      return response
    },
    (error: AxiosError) => {
      const status = error.response?.status
      const message = (error.response?.data as any)?.message || error.message

      // Handle specific error codes
      switch (status) {
        case 401:
          toast.error('Unauthorized. Please log in again.')
          // Clear auth and redirect to landing
          localStorage.removeItem('auth_token')
          localStorage.removeItem('api_key')
          window.location.href = '/landing'
          break
        case 403:
          toast.error('Forbidden. You do not have permission.')
          break
        case 404:
          toast.error('Resource not found.')
          break
        case 429:
          toast.error('Rate limit exceeded. Please try again later.')
          break
        case 500:
        case 502:
        case 503:
          toast.error('Server error. Please try again later.')
          break
        default:
          if (message && status) {
            toast.error(`Error ${status}: ${message}`)
          } else if (message) {
            toast.error(message)
          }
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const apiClient = createApiClient()

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}
