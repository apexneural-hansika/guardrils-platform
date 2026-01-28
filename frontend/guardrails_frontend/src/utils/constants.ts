import { Severity } from '../types/common'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Guardrails Platform'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/v1'
export const ORG_NAME = import.meta.env.VITE_ORG_NAME || 'Default Org'

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'text-blue-600 bg-blue-50 border-blue-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
}

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const POLICY_CATEGORIES = [
  { value: 'ai_safety', label: 'AI Safety', icon: '🤖', color: 'blue' },
  { value: 'data_protection', label: 'Data Protection', icon: '🔒', color: 'green' },
  { value: 'security', label: 'Security', icon: '🛡️', color: 'red' },
  { value: 'tool_control', label: 'Tool Control', icon: '🔧', color: 'purple' },
]

export const POLICY_SCOPES = [
  { value: 'input', label: 'Input', description: 'Check user inputs before processing' },
  { value: 'output', label: 'Output', description: 'Check LLM outputs before returning' },
  { value: 'tool_call', label: 'Tool Call', description: 'Check tool/function calls' },
  { value: 'metadata', label: 'Metadata', description: 'Check metadata and context' },
]

export const DECISION_TYPES = [
  { value: 'ALLOW', label: 'Allow', color: 'green', icon: '✓' },
  { value: 'DENY', label: 'Deny', color: 'red', icon: '✗' },
  { value: 'REDACT', label: 'Redact', color: 'yellow', icon: '⊘' },
  { value: 'AUDIT', label: 'Audit', color: 'blue', icon: '📝' },
]

export const ENVIRONMENTS = [
  { id: 'dev', name: 'Development', slug: 'dev', color: 'bg-blue-500' },
  { id: 'staging', name: 'Staging', slug: 'staging', color: 'bg-yellow-500' },
  { id: 'prod', name: 'Production', slug: 'prod', color: 'bg-red-500' },
]

export const COMPLIANCE_FRAMEWORKS = [
  { id: 'dpdp', name: 'DPDP', fullName: 'Digital Personal Data Protection Act (India)' },
  { id: 'gdpr', name: 'GDPR', fullName: 'General Data Protection Regulation' },
  { id: 'soc2', name: 'SOC2', fullName: 'Service Organization Control 2' },
  { id: 'hipaa', name: 'HIPAA', fullName: 'Health Insurance Portability and Accountability Act' },
  { id: 'iso27001', name: 'ISO 27001', fullName: 'Information Security Management' },
]

export const ROUTES = {
  overview: '/overview',
  policies: '/policies',
  policyDetail: (id: string) => `/policies/${id}`,
  policyNew: '/policies/new',
  checks: '/checks',
  enforcementMap: '/enforcement-map',
  heatmaps: '/heatmaps',
  violations: '/violations',
  compliance: '/compliance',
  settings: '/settings',
}
