import { Policy } from '../types/policy'
import { Violation } from '../types/violation'
import { Check } from '../types/api'

// Mock Policies
export const mockPolicies: Policy[] = [
  {
    id: 'pol-001',
    name: 'Prompt Injection Detection',
    description: 'Detects and blocks potential prompt injection attacks in user inputs',
    category: 'ai_safety',
    scope: ['input'],
    severity: 'critical',
    status: 'active',
    version: '1.0.0',
    endpoints: ['/v1/gateway/intercept', '/v1/gateway/evaluate'],
    checks: [
      {
        provider: 'security',
        check: 'prompt_injection',
        version: '1.0.0',
        config: { confidence_threshold: 0.7 },
        threshold: 0.7,
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [
      {
        type: 'slack',
        config: { channel: '#security-alerts' },
        enabled: true,
      },
      {
        type: 'log',
        config: {},
        enabled: true,
      },
    ],
    metadata: {
      owner: 'security-team@company.com',
      tags: ['security', 'injection', 'critical'],
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-20T14:30:00Z',
      lastTriggered: '2026-01-23T08:15:00Z',
    },
  },
  {
    id: 'pol-002',
    name: 'PII Detection & Redaction',
    description: 'Automatically detects and redacts personally identifiable information from outputs',
    category: 'data_protection',
    scope: ['output', 'metadata'],
    severity: 'high',
    status: 'active',
    version: '1.1.0',
    endpoints: ['/v1/gateway/evaluate'],
    checks: [
      {
        provider: 'data',
        check: 'pii_detect',
        version: '1.1.0',
        config: { types: ['email', 'phone', 'ssn', 'credit_card'] },
      },
    ],
    decision: {
      onFail: 'redact',
      onPass: 'allow',
    },
    actions: [
      {
        type: 'webhook',
        config: { url: 'https://api.company.com/compliance/pii-alert' },
        enabled: true,
      },
    ],
    metadata: {
      owner: 'compliance-team@company.com',
      tags: ['gdpr', 'dpdp', 'pii', 'data-protection'],
      createdAt: '2026-01-10T09:00:00Z',
      updatedAt: '2026-01-22T16:45:00Z',
      lastTriggered: '2026-01-23T11:30:00Z',
    },
  },
  {
    id: 'pol-003',
    name: 'Secrets Scanner',
    description: 'Scans for exposed API keys, tokens, and credentials in user inputs',
    category: 'security',
    scope: ['input'],
    severity: 'critical',
    status: 'active',
    version: '1.0.0',
    endpoints: ['/v1/gateway/intercept'],
    checks: [
      {
        provider: 'security',
        check: 'secrets_scan',
        version: '1.0.0',
        config: { patterns: ['api_key', 'bearer_token', 'private_key'] },
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [
      {
        type: 'slack',
        config: { channel: '#security-critical' },
        enabled: true,
      },
      {
        type: 'email',
        config: { to: 'security@company.com' },
        enabled: true,
      },
    ],
    metadata: {
      owner: 'security-team@company.com',
      tags: ['secrets', 'credentials', 'critical'],
      createdAt: '2026-01-12T11:00:00Z',
      updatedAt: '2026-01-18T10:20:00Z',
      lastTriggered: '2026-01-23T09:45:00Z',
    },
  },
  {
    id: 'pol-004',
    name: 'Toxic Content Filter',
    description: 'Filters out hate speech, profanity, and toxic content from outputs',
    category: 'ai_safety',
    scope: ['output'],
    severity: 'high',
    status: 'active',
    version: '1.0.0',
    endpoints: ['/v1/gateway/evaluate'],
    checks: [
      {
        provider: 'moderation',
        check: 'toxicity',
        version: '1.0.0',
        config: { threshold: 0.8 },
        threshold: 0.8,
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [
      {
        type: 'log',
        config: {},
        enabled: true,
      },
    ],
    metadata: {
      owner: 'content-team@company.com',
      tags: ['moderation', 'safety', 'content'],
      createdAt: '2026-01-14T13:00:00Z',
      updatedAt: '2026-01-21T15:10:00Z',
      lastTriggered: '2026-01-23T07:20:00Z',
    },
  },
  {
    id: 'pol-005',
    name: 'Tool Call Authorization',
    description: 'Ensures tool calls are authorized and within allowed scope',
    category: 'tool_control',
    scope: ['tool_call'],
    severity: 'medium',
    status: 'active',
    version: '1.0.0',
    endpoints: ['/v1/gateway/intercept'],
    checks: [
      {
        provider: 'authorization',
        check: 'tool_allowlist',
        version: '1.0.0',
        config: { allowed_tools: ['search', 'calculator', 'weather'] },
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [],
    metadata: {
      owner: 'platform-team@company.com',
      tags: ['tools', 'authorization'],
      createdAt: '2026-01-16T14:00:00Z',
      updatedAt: '2026-01-19T12:00:00Z',
      lastTriggered: '2026-01-22T18:30:00Z',
    },
  },
  {
    id: 'pol-006',
    name: 'Rate Limit Guardian',
    description: 'Prevents abuse by rate limiting requests per user',
    category: 'security',
    scope: ['input'],
    severity: 'medium',
    status: 'active',
    version: '1.0.0',
    endpoints: ['/v1/gateway/intercept'],
    checks: [
      {
        provider: 'rate_limit',
        check: 'user_rate_limit',
        version: '1.0.0',
        config: { max_requests_per_minute: 60 },
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [],
    metadata: {
      owner: 'platform-team@company.com',
      tags: ['rate-limit', 'abuse-prevention'],
      createdAt: '2026-01-17T15:00:00Z',
      updatedAt: '2026-01-20T11:30:00Z',
    },
  },
  {
    id: 'pol-007',
    name: 'Jailbreak Attempt Detector',
    description: 'Detects sophisticated attempts to bypass AI safety measures',
    category: 'ai_safety',
    scope: ['input'],
    severity: 'critical',
    status: 'draft',
    version: '0.9.0',
    endpoints: ['/v1/gateway/intercept'],
    checks: [
      {
        provider: 'security',
        check: 'jailbreak_detection',
        version: '0.9.0',
        config: { sensitivity: 'high' },
      },
    ],
    decision: {
      onFail: 'deny',
      onPass: 'allow',
    },
    actions: [
      {
        type: 'slack',
        config: { channel: '#ai-safety' },
        enabled: false,
      },
    ],
    metadata: {
      owner: 'ai-safety-team@company.com',
      tags: ['jailbreak', 'safety', 'experimental'],
      createdAt: '2026-01-22T10:00:00Z',
      updatedAt: '2026-01-23T09:00:00Z',
    },
  },
]

// Mock Violations
export const mockViolations: Violation[] = [
  {
    id: 'vio-001',
    policyId: 'pol-003',
    policyName: 'Secrets Scanner',
    endpoint: '/v1/gateway/intercept',
    decision: 'DENY',
    severity: 'critical',
    timestamp: '2026-01-23T09:45:23Z',
    checkResults: [
      {
        provider: 'security',
        check: 'secrets_scan',
        passed: false,
        confidence: 0.95,
        evidence: 'Detected API key pattern: sk-proj-...',
      },
    ],
    payload: {
      masked: true,
      preview: 'User input contained potential API key...',
    },
    traceId: 'trace-abc123',
    metadata: {
      userId: 'user-456',
      orgId: 'org-789',
      environment: 'production',
    },
  },
  {
    id: 'vio-002',
    policyId: 'pol-002',
    policyName: 'PII Detection & Redaction',
    endpoint: '/v1/gateway/evaluate',
    decision: 'REDACT',
    severity: 'high',
    timestamp: '2026-01-23T11:30:15Z',
    checkResults: [
      {
        provider: 'data',
        check: 'pii_detect',
        passed: false,
        confidence: 0.89,
        evidence: 'Detected email address and phone number in output',
        metadata: { pii_types: ['email', 'phone'] },
      },
    ],
    payload: {
      masked: true,
      preview: 'Output contained: john.doe@*****.com, +1-***-***-1234',
    },
    traceId: 'trace-def456',
    metadata: {
      userId: 'user-789',
      orgId: 'org-789',
      environment: 'production',
    },
  },
  {
    id: 'vio-003',
    policyId: 'pol-001',
    policyName: 'Prompt Injection Detection',
    endpoint: '/v1/gateway/intercept',
    decision: 'DENY',
    severity: 'critical',
    timestamp: '2026-01-23T08:15:42Z',
    checkResults: [
      {
        provider: 'security',
        check: 'prompt_injection',
        passed: false,
        confidence: 0.87,
        evidence: 'Detected injection pattern: "Ignore previous instructions..."',
      },
    ],
    payload: {
      masked: true,
      preview: 'Ignore previous instructions and...',
    },
    traceId: 'trace-ghi789',
    metadata: {
      userId: 'user-123',
      orgId: 'org-789',
      environment: 'production',
    },
  },
  {
    id: 'vio-004',
    policyId: 'pol-004',
    policyName: 'Toxic Content Filter',
    endpoint: '/v1/gateway/evaluate',
    decision: 'DENY',
    severity: 'high',
    timestamp: '2026-01-23T07:20:18Z',
    checkResults: [
      {
        provider: 'moderation',
        check: 'toxicity',
        passed: false,
        confidence: 0.92,
        evidence: 'Detected hate speech and profanity',
      },
    ],
    payload: {
      masked: true,
      preview: '[Content blocked due to toxicity]',
    },
    traceId: 'trace-jkl012',
    metadata: {
      userId: 'user-234',
      orgId: 'org-789',
      environment: 'production',
    },
  },
  {
    id: 'vio-005',
    policyId: 'pol-006',
    policyName: 'Rate Limit Guardian',
    endpoint: '/v1/gateway/intercept',
    decision: 'DENY',
    severity: 'medium',
    timestamp: '2026-01-23T12:05:33Z',
    checkResults: [
      {
        provider: 'rate_limit',
        check: 'user_rate_limit',
        passed: false,
        confidence: 1.0,
        evidence: 'User exceeded 60 requests per minute limit (actual: 87)',
      },
    ],
    payload: {
      masked: false,
    },
    traceId: 'trace-mno345',
    metadata: {
      userId: 'user-567',
      orgId: 'org-789',
      environment: 'production',
      requestCount: 87,
    },
  },
]

// Mock Checks
export const mockChecks: Check[] = [
  {
    name: 'prompt_injection',
    provider: 'security',
    version: '1.0.0',
    description: 'Detects prompt injection attempts using pattern matching and ML models',
    category: 'AI Safety',
    configSchema: {
      confidence_threshold: { type: 'number', min: 0, max: 1, default: 0.7 },
    },
    usedByPolicies: 3,
  },
  {
    name: 'pii_detect',
    provider: 'data',
    version: '1.1.0',
    description: 'Identifies personally identifiable information in text',
    category: 'Data Protection',
    configSchema: {
      types: { type: 'array', items: ['email', 'phone', 'ssn', 'credit_card'] },
    },
    usedByPolicies: 2,
  },
  {
    name: 'secrets_scan',
    provider: 'security',
    version: '1.0.0',
    description: 'Scans for exposed API keys, tokens, and credentials',
    category: 'Security',
    configSchema: {
      patterns: { type: 'array', items: ['api_key', 'bearer_token', 'private_key'] },
    },
    usedByPolicies: 5,
  },
  {
    name: 'toxicity',
    provider: 'moderation',
    version: '1.0.0',
    description: 'Detects toxic, hateful, or inappropriate content',
    category: 'Content Moderation',
    configSchema: {
      threshold: { type: 'number', min: 0, max: 1, default: 0.8 },
    },
    usedByPolicies: 4,
  },
  {
    name: 'tool_allowlist',
    provider: 'authorization',
    version: '1.0.0',
    description: 'Validates tool calls against an allowlist',
    category: 'Authorization',
    configSchema: {
      allowed_tools: { type: 'array', items: [] },
    },
    usedByPolicies: 1,
  },
  {
    name: 'user_rate_limit',
    provider: 'rate_limit',
    version: '1.0.0',
    description: 'Enforces rate limits per user to prevent abuse',
    category: 'Rate Limiting',
    configSchema: {
      max_requests_per_minute: { type: 'number', default: 60 },
    },
    usedByPolicies: 2,
  },
]

// Mock Stats
export const mockStats = {
  violations: {
    total: 1247,
    bySeverity: {
      low: 142,
      medium: 389,
      high: 534,
      critical: 182,
    },
    byDecision: {
      DENY: 876,
      REDACT: 234,
      AUDIT: 137,
      ALLOW: 0,
    },
    byEndpoint: {
      '/v1/gateway/intercept': 789,
      '/v1/gateway/evaluate': 458,
    },
    trend: [
      { date: '2026-01-17', count: 156 },
      { date: '2026-01-18', count: 178 },
      { date: '2026-01-19', count: 145 },
      { date: '2026-01-20', count: 203 },
      { date: '2026-01-21', count: 189 },
      { date: '2026-01-22', count: 167 },
      { date: '2026-01-23', count: 209 },
    ],
  },
}
