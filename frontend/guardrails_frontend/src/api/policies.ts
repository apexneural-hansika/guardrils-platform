import { apiClient } from './client'
import { Policy, PolicyCreateRequest, PolicyUpdateRequest, PolicyStats } from '../types/policy'
import { PaginatedResponse, PaginationParams } from '../types/common'

export const policiesApi = {
  // GET /policies - List all policies
  list: async (params?: PaginationParams & { status?: string; category?: string }): Promise<PaginatedResponse<Policy>> => {
    const response = await apiClient.get<PaginatedResponse<Policy>>('/policies', { params })
    return response.data
  },

  // GET /policies/:id - Get policy by ID
  getById: async (id: string): Promise<Policy> => {
    const response = await apiClient.get<Policy>(`/policies/${id}`)
    return response.data
  },

  // POST /policies - Create new policy
  create: async (policy: PolicyCreateRequest): Promise<Policy> => {
    const response = await apiClient.post<Policy>('/policies', policy)
    return response.data
  },

  // PUT /policies/:id - Update policy
  update: async (id: string, policy: PolicyUpdateRequest): Promise<Policy> => {
    const response = await apiClient.put<Policy>(`/policies/${id}`, policy)
    return response.data
  },

  // DELETE /policies/:id - Delete policy
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/policies/${id}`)
  },

  // GET /policies/:id/stats - Get policy statistics
  getStats: async (id: string): Promise<PolicyStats> => {
    const response = await apiClient.get<PolicyStats>(`/policies/${id}/stats`)
    return response.data
  },

  // POST /policies/:id/activate - Activate policy
  activate: async (id: string): Promise<Policy> => {
    const response = await apiClient.post<Policy>(`/policies/${id}/activate`)
    return response.data
  },

  // POST /policies/:id/deactivate - Deactivate policy
  deactivate: async (id: string): Promise<Policy> => {
    const response = await apiClient.post<Policy>(`/policies/${id}/deactivate`)
    return response.data
  },
}
