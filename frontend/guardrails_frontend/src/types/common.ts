export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type PolicyScope = 'input' | 'output' | 'tool_call' | 'metadata'
export type ActionType = 'allow' | 'deny' | 'redact' | 'audit' | 'alert'
export type PolicyStatus = 'active' | 'inactive' | 'draft'
export type DecisionType = 'ALLOW' | 'DENY' | 'REDACT' | 'AUDIT'

// Re-export types from specific modules
export type { User, Organization } from './organization'

export interface Environment {
  id: string
  name: string
  slug: 'dev' | 'staging' | 'prod'
  color: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}
