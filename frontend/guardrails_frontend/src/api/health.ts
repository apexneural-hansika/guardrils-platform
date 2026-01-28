import { apiClient } from './client'
import { HealthResponse } from '../types/api'

export const healthApi = {
  // GET /v1/health - Main health check
  check: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health')
    return response.data
  },

  // GET /v1/health/db - Database health check
  checkDatabase: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health/db')
    return response.data
  },

  // GET /v1/health/redis - Redis health check
  checkRedis: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health/redis')
    return response.data
  },
}
