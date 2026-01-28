import { Severity, DecisionType } from './common'

export interface Violation {
  id: string
  policyId: string
  policyName: string
  endpoint: string
  decision: DecisionType
  severity: Severity
  timestamp: string
  checkResults: CheckResult[]
  payload: {
    masked: boolean
    preview?: string
  }
  traceId?: string
  metadata: {
    userId?: string
    orgId?: string
    environment?: string
    [key: string]: any
  }
}

export interface CheckResult {
  provider: string
  check: string
  passed: boolean
  confidence: number
  evidence?: string
  metadata?: Record<string, any>
}

export interface ViolationFilters {
  severity?: Severity[]
  policyId?: string
  endpoint?: string
  decision?: DecisionType[]
  startDate?: string
  endDate?: string
  environment?: string
}

export interface ViolationStats {
  total: number
  bySeverity: Record<Severity, number>
  byDecision: Record<DecisionType, number>
  byEndpoint: Record<string, number>
  trend: {
    date: string
    count: number
  }[]
}
