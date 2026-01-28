import { Severity, PolicyScope, PolicyStatus, ActionType } from './common'

export interface Policy {
  id: string
  name: string
  description: string
  category: 'ai_safety' | 'data_protection' | 'security' | 'tool_control'
  scope: PolicyScope[]
  severity: Severity
  status: PolicyStatus
  version: string
  endpoints: string[]
  checks: PolicyCheck[]
  decision: {
    onFail: ActionType
    onPass: ActionType
  }
  actions: PolicyAction[]
  metadata: {
    owner?: string
    tags?: string[]
    createdAt: string
    updatedAt: string
    lastTriggered?: string
  }
}

export interface PolicyCheck {
  provider: string
  check: string
  version: string
  config: Record<string, any>
  threshold?: number
}

export interface PolicyAction {
  type: 'slack' | 'webhook' | 'email' | 'log'
  config: Record<string, any>
  enabled: boolean
}

export interface PolicyCreateRequest {
  name: string
  description: string
  category: Policy['category']
  scope: PolicyScope[]
  severity: Severity
  endpoints: string[]
  checks: PolicyCheck[]
  decision: Policy['decision']
  actions?: PolicyAction[]
}

export interface PolicyUpdateRequest extends Partial<PolicyCreateRequest> {
  status?: PolicyStatus
}

export interface PolicyStats {
  policyId: string
  totalEvaluations: number
  totalViolations: number
  lastTriggered?: string
  falsePositiveRate?: number
}
