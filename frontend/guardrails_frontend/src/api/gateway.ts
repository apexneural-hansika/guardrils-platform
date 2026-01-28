import { apiClient } from './client'
import { EvaluateRequest, EvaluateResponse, InterceptRequest, InterceptResponse } from '../types/api'

export const gatewayApi = {
  // POST /v1/gateway/evaluate - Evaluate content against policies
  evaluate: async (request: EvaluateRequest): Promise<EvaluateResponse> => {
    const response = await apiClient.post<EvaluateResponse>('/gateway/evaluate', request)
    return response.data
  },

  // POST /v1/gateway/intercept - Intercept and potentially modify content
  intercept: async (request: InterceptRequest): Promise<InterceptResponse> => {
    const response = await apiClient.post<InterceptResponse>('/gateway/intercept', request)
    return response.data
  },
}
