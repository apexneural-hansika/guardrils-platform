import { apiClient } from './client'
import { Violation, ViolationFilters, ViolationStats } from '../types/violation'
import { PaginatedResponse, PaginationParams } from '../types/common'

export const violationsApi = {
  // GET /violations - List violations with filters
  list: async (params?: PaginationParams & ViolationFilters): Promise<PaginatedResponse<Violation>> => {
    const response = await apiClient.get<PaginatedResponse<Violation>>('/violations', { params })
    return response.data
  },

  // GET /violations/:id - Get violation by ID
  getById: async (id: string): Promise<Violation> => {
    const response = await apiClient.get<Violation>(`/violations/${id}`)
    return response.data
  },

  // GET /violations/stats - Get violation statistics
  getStats: async (filters?: ViolationFilters): Promise<ViolationStats> => {
    const response = await apiClient.get<ViolationStats>('/violations/stats', { params: filters })
    return response.data
  },

  // POST /violations/:id/export - Export violation
  export: async (id: string, format: 'json' | 'csv' | 'pdf'): Promise<Blob> => {
    const response = await apiClient.post(`/violations/${id}/export`, { format }, {
      responseType: 'blob',
    })
    return response.data
  },

  // POST /violations/export - Bulk export violations
  bulkExport: async (filters: ViolationFilters, format: 'json' | 'csv' | 'pdf'): Promise<Blob> => {
    const response = await apiClient.post('/violations/export', { ...filters, format }, {
      responseType: 'blob',
    })
    return response.data
  },
}
