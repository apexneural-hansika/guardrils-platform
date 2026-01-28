import { PaginatedResponse, PaginationParams } from '../types/common'
import { apiClient } from './client'
import {
  RequestResponse,
  RequestDetailResponse,
  DecisionResponse,
  ViolationResponse,
} from '../types/audit'

export const auditApi = {
  // GET /v1/audit/requests - List audit requests
  listRequests: async (
    orgId: string,
    params?: PaginationParams & {
      app_id?: string
      user_id?: string
      session_id?: string
      scope?: string
      start_date?: string
      end_date?: string
    }
  ): Promise<RequestResponse[]> => {
    const response = await apiClient.get<RequestResponse[]>('/audit/requests', {
      params: { org_id: orgId, ...params },
    })
    return response.data
  },

  // GET /v1/audit/requests/{trace_id} - Get request details
  getRequest: async (traceId: string): Promise<RequestDetailResponse> => {
    const response = await apiClient.get<RequestDetailResponse>(`/audit/requests/${traceId}`)
    return response.data
  },

  // GET /v1/audit/requests/{trace_id}/decisions - Get decisions for a request
  getDecisions: async (traceId: string): Promise<DecisionResponse[]> => {
    const response = await apiClient.get<DecisionResponse[]>(`/audit/requests/${traceId}/decisions`)
    return response.data
  },

  // GET /v1/audit/requests/{trace_id}/violations - Get violations for a request
  getViolations: async (traceId: string): Promise<ViolationResponse[]> => {
    const response = await apiClient.get<ViolationResponse[]>(`/audit/requests/${traceId}/violations`)
    return response.data
  },
}

