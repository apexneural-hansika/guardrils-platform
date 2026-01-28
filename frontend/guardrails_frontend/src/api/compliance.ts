import { apiClient } from './client'
import { ComplianceFramework, ComplianceControl } from '../types/api'

export const complianceApi = {
  // GET /compliance/frameworks - List all compliance frameworks
  listFrameworks: async (): Promise<ComplianceFramework[]> => {
    const response = await apiClient.get<ComplianceFramework[]>('/compliance/frameworks')
    return response.data
  },

  // GET /compliance/frameworks/:id - Get framework by ID
  getFramework: async (id: string): Promise<ComplianceFramework> => {
    const response = await apiClient.get<ComplianceFramework>(`/compliance/frameworks/${id}`)
    return response.data
  },

  // GET /compliance/controls/:id - Get control by ID
  getControl: async (id: string): Promise<ComplianceControl> => {
    const response = await apiClient.get<ComplianceControl>(`/compliance/controls/${id}`)
    return response.data
  },

  // POST /compliance/report - Generate compliance report
  generateReport: async (
    frameworkId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Blob> => {
    const response = await apiClient.post(
      '/compliance/report',
      { frameworkId, startDate, endDate },
      { responseType: 'blob' }
    )
    return response.data
  },

  // POST /compliance/controls/:id/link-policy - Link policy to control
  linkPolicy: async (controlId: string, policyId: string): Promise<ComplianceControl> => {
    const response = await apiClient.post<ComplianceControl>(
      `/compliance/controls/${controlId}/link-policy`,
      { policyId }
    )
    return response.data
  },

  // DELETE /compliance/controls/:id/unlink-policy - Unlink policy from control
  unlinkPolicy: async (controlId: string, policyId: string): Promise<ComplianceControl> => {
    const response = await apiClient.delete<ComplianceControl>(
      `/compliance/controls/${controlId}/unlink-policy`,
      { data: { policyId } }
    )
    return response.data
  },
}
