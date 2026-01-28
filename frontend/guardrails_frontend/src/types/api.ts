export interface HealthResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  version?: string
}

// Gateway API Types (matching backend/app/schemas/gateway.py)
export type PolicyScope = 
  | 'llm.input'
  | 'llm.output'
  | 'tool.call'
  | 'tool.result'
  | 'data.access'

export type ActionType = 
  | 'allow'
  | 'block'
  | 'redact'
  | 'rewrite'
  | 'route'
  | 'escalate'
  | 'log_only'

export interface ContentPayload {
  text?: string
  model?: string
  tool_name?: string
  tool_args?: Record<string, any>
  tokens?: number
  messages?: Array<Record<string, any>>
}

export interface EvaluateRequest {
  app_id: string
  env?: string
  user_id?: string
  session_id?: string
  team_id?: string
  scope: PolicyScope
  content: ContentPayload
  trace_id?: string
  dry_run?: boolean
  metadata?: Record<string, any>
}

export interface CheckResult {
  check_name: string
  status: 'pass' | 'fail' | 'error' | 'skip'
  score?: number
  message?: string
  evidence?: Record<string, any>
  latency_ms: number
}

export interface PolicyDecision {
  policy_id: string
  policy_name: string
  policy_version: number
  action: ActionType
  reason: string
  checks: CheckResult[]
}

export interface EvaluateResponse {
  trace_id: string
  request_id: string
  action: ActionType
  reason: string
  policies_evaluated: number
  policies_triggered: number
  decisions: PolicyDecision[]
  modified_content?: ContentPayload
  total_latency_ms: number
  timestamp: string
}

export interface InterceptRequest {
  app_id: string
  env?: string
  user_id?: string
  session_id?: string
  input: ContentPayload
  provider: 'openai' | 'anthropic' | 'azure' | 'custom'
  endpoint?: string
  call_config: Record<string, any>
  trace_id?: string
  timeout_ms?: number
  metadata?: Record<string, any>
}

export interface InterceptResponse {
  trace_id: string
  input_decision: EvaluateResponse
  call_executed: boolean
  call_response?: Record<string, any>
  call_error?: string
  call_latency_ms?: number
  output_decision?: EvaluateResponse
  final_action: ActionType
  final_content?: ContentPayload
  total_latency_ms: number
}

export interface Check {
  name: string
  provider: string
  version: string
  description: string
  category: string
  configSchema?: Record<string, any>
  usedByPolicies: number
}

export interface ComplianceFramework {
  id: string
  name: 'DPDP' | 'GDPR' | 'SOC2' | 'HIPAA' | 'ISO27001'
  controls: ComplianceControl[]
}

export interface ComplianceControl {
  id: string
  frameworkId: string
  name: string
  description: string
  linkedPolicies: string[]
  status: 'compliant' | 'partial' | 'non_compliant'
  evidence: {
    violationId: string
    timestamp: string
  }[]
}
