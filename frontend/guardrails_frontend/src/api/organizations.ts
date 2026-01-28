import { apiClient } from './client'
import {
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationResponse,
  UserCreate,
  UserUpdate,
  UserResponse,
  APIKeyCreate,
  APIKeyCreateResponse,
  APIKeyResponse,
} from '../types/organization'
import { PaginatedResponse, PaginationParams } from '../types/common'

export const organizationsApi = {
  // Organizations
  create: async (data: OrganizationCreate): Promise<OrganizationResponse> => {
    const response = await apiClient.post<OrganizationResponse>('/organizations', data)
    return response.data
  },

  list: async (params?: PaginationParams): Promise<OrganizationResponse[]> => {
    const response = await apiClient.get<OrganizationResponse[]>('/organizations', { params })
    return response.data
  },

  getById: async (orgId: string): Promise<OrganizationResponse> => {
    const response = await apiClient.get<OrganizationResponse>(`/organizations/${orgId}`)
    return response.data
  },

  update: async (orgId: string, data: OrganizationUpdate): Promise<OrganizationResponse> => {
    const response = await apiClient.put<OrganizationResponse>(`/organizations/${orgId}`, data)
    return response.data
  },

  // Users
  createUser: async (orgId: string, data: UserCreate): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>(`/organizations/${orgId}/users`, data)
    return response.data
  },

  listUsers: async (orgId: string, params?: PaginationParams): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>(`/organizations/${orgId}/users`, { params })
    return response.data
  },

  getUser: async (userId: string): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/organizations/users/${userId}`)
    return response.data
  },

  updateUser: async (userId: string, data: UserUpdate): Promise<UserResponse> => {
    const response = await apiClient.put<UserResponse>(`/organizations/users/${userId}`, data)
    return response.data
  },

  // API Keys
  createApiKey: async (orgId: string, data: APIKeyCreate): Promise<APIKeyCreateResponse> => {
    const response = await apiClient.post<APIKeyCreateResponse>(`/organizations/${orgId}/api-keys`, data)
    return response.data
  },

  listApiKeys: async (orgId: string, params?: PaginationParams): Promise<APIKeyResponse[]> => {
    const response = await apiClient.get<APIKeyResponse[]>(`/organizations/${orgId}/api-keys`, { params })
    return response.data
  },

  revokeApiKey: async (keyId: string): Promise<void> => {
    await apiClient.delete(`/organizations/api-keys/${keyId}`)
  },
}
