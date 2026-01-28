import { X, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { formatPercentage } from '../../utils/formatters'

interface WhyHotPanelProps {
  isOpen: boolean
  onClose: () => void
  data: {
    // For Policy × Endpoint
    policy?: string
    endpoint?: string
    // For Endpoint × Severity
    endpointOnly?: string
    severity?: string
    // For Category × Severity
    category?: string
    triggers: number
    totalRequests: number
    triggerRate: number
    trend: number
    topSources: Array<{ source: string; count: number; percentage: number }>
    severityLevel?: string
  } | null
}

export default function WhyHotPanel({ isOpen, onClose, data }: WhyHotPanelProps) {
  if (!isOpen || !data) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-danger-600" />
              Why Is This Hot?
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {data.policy && data.endpoint && `${data.policy} • ${data.endpoint}`}
              {data.endpointOnly && data.severity && `${data.endpointOnly} • ${data.severity}`}
              {data.category && data.severity && `${data.category} • ${data.severity}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Metrics */}
        <div className="space-y-4 mb-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Triggers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.triggers}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Trigger Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data.triggerRate.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{data.totalRequests.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant={
                (data.severityLevel || data.severity) === 'Critical' || (data.severityLevel || data.severity) === 'High'
                  ? 'danger'
                  : (data.severityLevel || data.severity) === 'Medium'
                  ? 'warning'
                  : 'default'
              }
            >
              {data.severityLevel || data.severity}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Trend: {data.trend > 0 ? '↑' : data.trend < 0 ? '↓' : '→'} {Math.abs(data.trend).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Top Sources */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Top Sources</h3>
          <div className="space-y-2">
            {data.topSources.map((source, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{source.source}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{source.count} triggers</p>
                </div>
                <Badge variant="info" size="sm">
                  {formatPercentage(source.count, data.triggers)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Suggested Actions</h3>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900 dark:text-white">
                Enable stricter input redaction for API keys
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900 dark:text-white">
                Alert affected tenants about policy violations
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-900 dark:text-white">
                Enable pre-SDK validation to catch issues earlier
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button variant="primary" fullWidth>
            View All Violations
          </Button>
          {data.policy && (
            <Button variant="secondary" fullWidth icon={<ExternalLink className="w-4 h-4" />}>
              Configure Policy
            </Button>
          )}
          {data.endpointOnly && (
            <Button variant="secondary" fullWidth icon={<ExternalLink className="w-4 h-4" />}>
              View Endpoint Details
            </Button>
          )}
          {data.category && (
            <Button variant="secondary" fullWidth icon={<ExternalLink className="w-4 h-4" />}>
              View Category Details
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
