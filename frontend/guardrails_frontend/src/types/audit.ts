// Audit Types (matching backend/app/schemas/audit.py)

export interface RequestResponse {
  id: string
  trace_id: string
  org_id: string
  app_id: string
  env_id?: string
  user_id?: string
  session_id?: string
  scope: string
  input_preview?: string
  model?: string
  token_count?: number
  created_at: string
}

export interface DecisionResponse {
  id: string
  request_id: string
  trace_id: string
  policy_id?: string
  action: string
  reason?: string
  confidence?: number
  latency_ms?: number
  created_at: string
}

export interface ViolationResponse {
  id: string
  request_id: string
  trace_id: string
  check_name: string
  check_version?: string
  severity: string
  category?: string
  message?: string
  evidence: Record<string, any>
  location_start?: number
  location_end?: number
  created_at: string
}

export interface RequestDetailResponse {
  request: RequestResponse
  decisions: DecisionResponse[]
  violations: ViolationResponse[]
}

