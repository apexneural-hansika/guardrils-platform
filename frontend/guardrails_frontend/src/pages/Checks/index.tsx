import { useQuery } from '@tanstack/react-query'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Table from '../../components/common/Table'
import Spinner from '../../components/common/Spinner'
import { CheckCircle } from 'lucide-react'
import { healthApi } from '../../api/health'
import { Check } from '../../types/api'

// Note: Checks endpoint not yet implemented in backend
// This page shows a placeholder until the backend endpoint is available
export default function Checks() {
  // For now, we'll use a placeholder query
  // Once backend implements GET /checks, we can use:
  // const { data: checks, isLoading } = useQuery({
  //   queryKey: ['checks'],
  //   queryFn: () => checksApi.list(),
  // })

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
  })

  // Placeholder data structure - will be replaced when backend endpoint is ready
  const mockChecks: Check[] = [
    {
      name: 'pii_detection',
      provider: 'guardrails',
      version: '1.0.0',
      description: 'Detects personally identifiable information (PII) in text',
      category: 'data_protection',
      usedByPolicies: 0,
    },
    {
      name: 'secrets_scan',
      provider: 'guardrails',
      version: '1.0.0',
      description: 'Scans for exposed API keys, tokens, and credentials',
      category: 'security',
      usedByPolicies: 0,
    },
    {
      name: 'toxicity',
      provider: 'guardrails',
      version: '1.0.0',
      description: 'Detects toxic, harmful, or inappropriate content',
      category: 'ai_safety',
      usedByPolicies: 0,
    },
    {
      name: 'prompt_injection',
      provider: 'guardrails',
      version: '1.0.0',
      description: 'Detects prompt injection attempts',
      category: 'security',
      usedByPolicies: 0,
    },
  ]

  const columns = [
    { key: 'provider', header: 'Provider' },
    { key: 'name', header: 'Check' },
    {
      key: 'version',
      header: 'Version',
      render: (item: Check) => <Badge size="sm">{item.version}</Badge>,
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: Check) => <Badge variant="info">{item.category}</Badge>,
    },
    {
      key: 'usedByPolicies',
      header: 'Used By',
      render: (item: Check) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {item.usedByPolicies} policies
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Checks & Providers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View available checks and their providers
        </p>
      </div>

      {/* Backend Status */}
      {health && (
        <Card>
          <div className="flex items-center gap-2">
            <Badge variant={health.status === 'healthy' ? 'success' : 'danger'}>
              Backend: {health.status}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Checks endpoint not yet implemented in backend
            </span>
          </div>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <div className="flex items-start space-x-4">
          <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Provider-Based Architecture
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Checks are modular and can be added, removed, or updated independently.
              Each check is versioned for compatibility and transparency.
            </p>
            <p className="text-xs text-warning-600 dark:text-warning-400 mt-2">
              ⚠️ Note: This page shows placeholder data. The backend checks endpoint will be implemented soon.
            </p>
          </div>
        </div>
      </Card>

      {/* Checks Table */}
      <Card padding="none">
        <Table
          data={mockChecks}
          columns={columns}
          emptyMessage="No checks available"
          onRowClick={() => {/* View check detail */}}
        />
      </Card>
    </div>
  )
}
