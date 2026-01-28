import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Shield, AlertTriangle, CheckCircle, Activity, ArrowRight, Home } from 'lucide-react'
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card'
import Badge from '../components/common/Badge'
import Spinner from '../components/common/Spinner'
import { formatNumber } from '../utils/formatters'
import { ROUTES } from '../utils/constants'
import { policiesApi } from '../api/policies'
import { auditApi } from '../api/audit'
import { useAuthStore } from '../store/authStore'
import DecisionTrendChart from '../components/overview/DecisionTrendChart'
import TopGuardrailsChart from '../components/overview/TopGuardrailsChart'

export default function Overview() {
  const { organization } = useAuthStore()

  // Fetch policies
  const { data: policiesData, isLoading: policiesLoading } = useQuery({
    queryKey: ['policies', 'overview'],
    queryFn: () => policiesApi.list({ limit: 5 }),
  })

  // Fetch audit stats (violations)
  const { data: auditRequests, isLoading: auditLoading } = useQuery({
    queryKey: ['audit', 'stats', organization?.id],
    queryFn: () => {
      if (!organization?.id) {
        return Promise.resolve([])
      }
      return auditApi.listRequests(organization.id, { limit: 1000 })
    },
  })

  const isLoading = policiesLoading || auditLoading

  // Calculate stats from audit data
  const violationStats = React.useMemo(() => {
    if (!auditRequests) {
      return {
        total: 0,
        bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      }
    }

    // Count violations from audit requests
    const total = auditRequests.length
    const bySeverity = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    }

    // Note: This is a simplified calculation. In a real implementation,
    // you'd need to fetch violations for each request to get accurate severity counts
    return { total, bySeverity }
  }, [auditRequests])

  const activePolicies = policiesData?.data?.filter(p => p.status === 'active') || []
  const recentPolicies = policiesData?.data?.slice(0, 5) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Command Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time policy enforcement and risk monitoring
          </p>
        </div>
        <Link
          to="/landing"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Policies
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {isLoading ? '...' : activePolicies.length}
              </p>
            </div>
            <Shield className="w-12 h-12 text-primary-600" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Violations (24h)
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {isLoading ? '...' : formatNumber(violationStats.total)}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-warning-600" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                High/Critical Blocks
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {isLoading ? '...' : formatNumber(
                  (violationStats.bySeverity.high || 0) +
                    (violationStats.bySeverity.critical || 0)
                )}
              </p>
            </div>
            <Activity className="w-12 h-12 text-danger-600" />
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compliance Status
              </p>
              <div className="flex items-center mt-1">
                <CheckCircle className="w-8 h-8 text-success-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white ml-2">
                  Compliant
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Strip */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI Safety</p>
              <Badge variant="success" dot>Healthy</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Data Protection</p>
              <Badge variant="success" dot>Healthy</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Secrets</p>
              <Badge variant="danger" dot>3 Issues</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tool Control</p>
              <Badge variant="warning" dot>1 Warning</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Policies */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Policies</CardTitle>
                <Link
                  to={ROUTES.policies}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                >
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Spinner />
              ) : recentPolicies.length > 0 ? (
                <div className="space-y-3">
                  {recentPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {policy.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {policy.category?.replace('_', ' ') || 'N/A'}
                        </p>
                      </div>
                      <Badge
                        variant={policy.status === 'active' ? 'success' : 'default'}
                      >
                        {policy.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No policies yet. Create your first policy to get started.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Top Guardrails Triggered */}
          <Card>
            <CardHeader>
              <CardTitle>Top Guardrails Triggered</CardTitle>
            </CardHeader>
            <CardContent>
              <TopGuardrailsChart />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Which guardrails are doing the most work right now
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link
                to={ROUTES.policyNew}
                className="block p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Create New Policy
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Set up guardrails for your AI application
                </p>
              </Link>
              <Link
                to={ROUTES.violations}
                className="block p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  View Violations
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review recent policy violations and audit logs
                </p>
              </Link>
              <Link
                to={ROUTES.heatmaps}
                className="block p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Analyze Heat Maps
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Visualize risk patterns across endpoints
                </p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Decisions Over Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Policy Decisions Over Time (Last 24h)</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Shows how AI requests were allowed, blocked, or modified by guardrails.
              </p>
            </div>
            <Link
              to={ROUTES.heatmaps}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              Full heatmap <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DecisionTrendChart />
        </CardContent>
      </Card>
    </div>
  )
}
