import { apiClient } from './client'
import {
  AppCreate,
  AppUpdate,
  AppResponse,
  EnvironmentCreate,
  EnvironmentResponse,
} from '../types/application'
import { PaginatedResponse, PaginationParams } from '../types/common'

export const applicationsApi = {
  // Applications
  create: async (data: AppCreate): Promise<AppResponse> => {
    const response = await apiClient.post<AppResponse>('/apps', data)
    return response.data
  },

  list: async (params?: PaginationParams & { org_id?: string }): Promise<AppResponse[]> => {
    const response = await apiClient.get<AppResponse[]>('/apps', { params })
    return response.data
  },

  getById: async (appId: string): Promise<AppResponse> => {
    const response = await apiClient.get<AppResponse>(`/apps/${appId}`)
    return response.data
  },

  update: async (appId: string, data: AppUpdate): Promise<AppResponse> => {
    const response = await apiClient.put<AppResponse>(`/apps/${appId}`, data)
    return response.data
  },

  delete: async (appId: string): Promise<void> => {
    await apiClient.delete(`/apps/${appId}`)
  },

  // Environments
  createEnvironment: async (appId: string, data: EnvironmentCreate): Promise<EnvironmentResponse> => {
    const response = await apiClient.post<EnvironmentResponse>(`/apps/${appId}/environments`, data)
    return response.data
  },

  listEnvironments: async (appId: string, params?: PaginationParams): Promise<PaginatedResponse<EnvironmentResponse>> => {
    const response = await apiClient.get<PaginatedResponse<EnvironmentResponse>>(`/apps/${appId}/environments`, { params })
    return response.data
  },
}
