import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { formatRelativeTime } from '../../utils/formatters'
import { Download, Filter } from 'lucide-react'
import { auditApi } from '../../api/audit'
import { useAuthStore } from '../../store/authStore'

export default function Violations() {
  const { organization } = useAuthStore()
  const [severityFilter, setSeverityFilter] = useState('')
  const [decisionFilter, setDecisionFilter] = useState('')
  const [endpointFilter, setEndpointFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  // Fetch audit requests (which contain violations)
  const { data: auditRequests, isLoading, error } = useQuery({
    queryKey: ['audit', 'violations', organization?.id, severityFilter, decisionFilter, endpointFilter, dateFilter],
    queryFn: async () => {
      if (!organization?.id) return []
      
      try {
        const requests = await auditApi.listRequests(organization.id, {
          scope: endpointFilter || undefined,
          start_date: dateFilter || undefined,
          limit: 100,
        })

        // Fetch violations for each request
        const requestsWithViolations = await Promise.all(
          requests.map(async (request) => {
            try {
              const violations = await auditApi.getViolations(request.trace_id)
              return { request, violations }
            } catch {
              return { request, violations: [] }
            }
          })
        )

        return requestsWithViolations
      } catch (err) {
        console.error('Error fetching violations:', err)
        return []
      }
    },
  })

  // Flatten violations from all requests
  const allViolations = auditRequests?.flatMap(({ request, violations }) =>
    violations.map(violation => ({
      ...violation,
      request,
      timestamp: violation.created_at,
      policyName: violation.check_name, // Simplified - would need policy lookup
      policyId: violation.id,
      endpoint: request.scope,
    }))
  ) || []

  // Apply filters
  const filteredViolations = allViolations.filter(v => {
    if (severityFilter && v.severity !== severityFilter) return false
    if (decisionFilter && v.severity !== decisionFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Violations & Audit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            SOC2-grade audit trail of policy violations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />}>
            Filters
          </Button>
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Decisions</option>
            <option value="DENY">Deny</option>
            <option value="REDACT">Redact</option>
            <option value="AUDIT">Audit</option>
          </select>
          <select
            value={endpointFilter}
            onChange={(e) => setEndpointFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Endpoints</option>
            <option value="llm.input">LLM Input</option>
            <option value="llm.output">LLM Output</option>
            <option value="tool.call">Tool Call</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            placeholder="Date"
          />
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <div className="text-center py-8 text-danger-600 dark:text-danger-400">
            <p className="font-medium">Failed to load violations</p>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </Card>
      )}

      {/* Violation Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <div className="text-center py-8">
              <Spinner />
              <p className="text-gray-500 dark:text-gray-400 mt-2">Loading violations...</p>
            </div>
          </Card>
        ) : filteredViolations.length > 0 ? (
          filteredViolations.map((violation) => (
            <Card key={violation.id} hover className="cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {violation.check_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Policy: {violation.policyId} • {violation.request?.scope || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {violation.message && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {violation.message}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge
                      variant={
                        violation.severity === 'critical' || violation.severity === 'high'
                          ? 'danger'
                          : violation.severity === 'medium'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {violation.severity}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(violation.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No violations found</p>
              <p className="text-sm mt-1">All policies are functioning as expected</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
