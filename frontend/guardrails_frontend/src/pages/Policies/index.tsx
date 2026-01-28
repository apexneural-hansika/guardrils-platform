import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Badge from '../../components/common/Badge'
import Table from '../../components/common/Table'
import Spinner from '../../components/common/Spinner'
import { Policy } from '../../types/policy'
import { ROUTES, SEVERITY_LABELS } from '../../utils/constants'
import { formatRelativeTime } from '../../utils/formatters'
import { policiesApi } from '../../api/policies'

export default function PoliciesList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  // Fetch policies from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['policies', statusFilter, categoryFilter],
    queryFn: () => policiesApi.list({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
    }),
  })

  const filteredPolicies = (data?.data || []).filter(policy => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        policy.name?.toLowerCase().includes(query) ||
        policy.description?.toLowerCase().includes(query)
      )
    }
    return true
  })

  const columns = [
    {
      key: 'name',
      header: 'Policy',
      render: (policy: Policy) => (
        <div>
          <Link
            to={ROUTES.policyDetail(policy.id)}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            {policy.name}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {policy.description?.substring(0, 50) || 'No description'}...
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (policy: Policy) => (
        <Badge variant="default">
          {policy.category?.replace('_', ' ') || 'N/A'}
        </Badge>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      render: (policy: Policy) => (
        <div className="flex flex-wrap gap-1">
          {policy.scope?.slice(0, 2).map((s) => (
            <Badge key={s} size="sm" variant="info">
              {s}
            </Badge>
          ))}
          {policy.scope && policy.scope.length > 2 && (
            <Badge size="sm" variant="default">
              +{policy.scope.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (policy: Policy) => (
        <Badge
          variant={
            policy.severity === 'critical' || policy.severity === 'high'
              ? 'danger'
              : policy.severity === 'medium'
              ? 'warning'
              : 'default'
          }
        >
          {SEVERITY_LABELS[policy.severity] || policy.severity}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (policy: Policy) => (
        <Badge variant={policy.status === 'active' ? 'success' : 'default'} dot>
          {policy.status}
        </Badge>
      ),
    },
    {
      key: 'lastTriggered',
      header: 'Last Trigger',
      render: (policy: Policy) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {policy.metadata?.lastTriggered
            ? formatRelativeTime(policy.metadata.lastTriggered)
            : 'Never'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Policies
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your AI guardrail policies
          </p>
        </div>
        <Link to={ROUTES.policyNew}>
          <Button icon={<Plus className="w-4 h-4" />}>
            Create Policy
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Categories</option>
            <option value="ai_safety">AI Safety</option>
            <option value="data_protection">Data Protection</option>
            <option value="security">Security</option>
            <option value="tool_control">Tool Control</option>
          </select>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <div className="text-center py-8 text-danger-600 dark:text-danger-400">
            <p className="font-medium">Failed to load policies</p>
            <p className="text-sm mt-1">
              {error instanceof Error ? error.message : 'An error occurred'}
            </p>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card padding="none">
        <Table
          data={filteredPolicies}
          columns={columns}
          loading={isLoading}
          emptyMessage="No policies found. Create your first policy to get started."
          onRowClick={(policy) => navigate(ROUTES.policyDetail(policy.id))}
        />
      </Card>
    </div>
  )
}
