import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Pause, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { policiesApi } from '../../api/policies'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Card, { CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import Spinner from '../../components/common/Spinner'
import { useToast } from '../../hooks/useToast'
import { ROUTES, SEVERITY_LABELS } from '../../utils/constants'
import { formatDateTime } from '../../utils/formatters'

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('summary')
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()

  // Fetch policy from API
  const { data: policy, isLoading, error } = useQuery({
    queryKey: ['policy', id],
    queryFn: () => policiesApi.getById(id!),
    enabled: !!id,
  })

  // Fetch policy stats
  const { data: stats } = useQuery({
    queryKey: ['policy', id, 'stats'],
    queryFn: () => policiesApi.getStats(id!),
    enabled: !!id,
  })

  // Activate/Deactivate mutations
  const activateMutation = useMutation({
    mutationFn: () => policiesApi.activate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', id] })
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy activated')
    },
    onError: (error: any) => {
      toast.error('Failed to activate policy: ' + error.message)
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: () => policiesApi.deactivate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy', id] })
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy deactivated')
    },
    onError: (error: any) => {
      toast.error('Failed to deactivate policy: ' + error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => policiesApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies'] })
      toast.success('Policy deleted')
      navigate(ROUTES.policies)
    },
    onError: (error: any) => {
      toast.error('Failed to delete policy: ' + error.message)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !policy) {
    return (
      <div className="text-center py-12">
        <p className="text-danger-600 dark:text-danger-400 font-medium">
          {error instanceof Error ? error.message : 'Policy not found'}
        </p>
        <Link to={ROUTES.policies} className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to Policies
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'scope', label: 'Scope' },
    { id: 'checks', label: 'Checks' },
    { id: 'decision', label: 'Decision Logic' },
    { id: 'yaml', label: 'YAML View' },
    { id: 'history', label: 'History' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to={ROUTES.policies}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Policies
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {policy.name}
              </h1>
              <Badge variant={policy.status === 'active' ? 'success' : 'default'} dot>
                {policy.status}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {policy.description}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Edit className="w-4 h-4" />}>
              Edit
            </Button>
            {policy.status === 'active' ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<Pause className="w-4 h-4" />}
                onClick={() => deactivateMutation.mutate()}
                loading={deactivateMutation.isPending}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                onClick={() => activateMutation.mutate()}
                loading={activateMutation.isPending}
              >
                Activate
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                if (confirm('Are you sure you want to delete this policy?')) {
                  deleteMutation.mutate()
                }
              }}
              loading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Policy Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Category</dt>
                  <dd className="mt-1">
                    <Badge variant="default">{policy.category?.replace('_', ' ') || 'N/A'}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Severity</dt>
                  <dd className="mt-1">
                    <Badge variant={policy.severity === 'critical' || policy.severity === 'high' ? 'danger' : 'warning'}>
                      {SEVERITY_LABELS[policy.severity] || policy.severity}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Version</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{policy.version || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Owner</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">{policy.metadata?.owner || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Total Evaluations</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {stats?.totalEvaluations || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Total Violations</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {stats?.totalViolations || 0}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600 dark:text-gray-400">Last Triggered</dt>
                  <dd className="mt-1 text-gray-900 dark:text-white">
                    {stats?.lastTriggered
                      ? formatDateTime(stats.lastTriggered)
                      : policy.metadata?.lastTriggered
                      ? formatDateTime(policy.metadata.lastTriggered)
                      : 'Never'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'scope' && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Endpoints
                </h4>
                <div className="flex flex-wrap gap-2">
                  {policy.endpoints?.map((endpoint, i) => (
                    <Badge key={i} variant="info">
                      {endpoint}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No endpoints configured</p>}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Scope Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {policy.scope?.map((scope, i) => (
                    <Badge key={i} variant="default">
                      {scope}
                    </Badge>
                  )) || <p className="text-sm text-gray-500">No scope configured</p>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'checks' && (
        <Card>
          <CardHeader>
            <CardTitle>Configured Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {policy.checks && policy.checks.length > 0 ? (
                policy.checks.map((check, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {check.provider} / {check.check}
                      </h4>
                      <Badge size="sm">v{check.version}</Badge>
                    </div>
                    {check.threshold && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Threshold: {check.threshold}
                      </p>
                    )}
                    {check.config && Object.keys(check.config).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          Configuration
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-2 rounded">
                          {JSON.stringify(check.config, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No checks configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'decision' && (
        <Card>
          <CardHeader>
            <CardTitle>Decision Logic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  On Failure
                </h4>
                <Badge variant="danger" size="lg">
                  {policy.decision?.onFail || 'N/A'}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  On Pass
                </h4>
                <Badge variant="success" size="lg">
                  {policy.decision?.onPass || 'N/A'}
                </Badge>
              </div>
              {policy.actions && policy.actions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actions
                  </h4>
                  <div className="space-y-2">
                    {policy.actions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant={action.enabled ? 'success' : 'default'}>
                          {action.type}
                        </Badge>
                        {!action.enabled && (
                          <span className="text-xs text-gray-500">(Disabled)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'yaml' && (
        <Card>
          <CardHeader>
            <CardTitle>YAML Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(policy, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Change History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              History tracking coming soon
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
