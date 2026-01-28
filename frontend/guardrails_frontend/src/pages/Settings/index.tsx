import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/common/Card'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import Table from '../../components/common/Table'
import Spinner from '../../components/common/Spinner'
import { Save, Plus, Trash2, Copy } from 'lucide-react'
import { organizationsApi } from '../../api/organizations'
import { applicationsApi } from '../../api/applications'
import { useToast } from '../../hooks/useToast'
import { formatDateTime } from '../../utils/formatters'
import { useAuthStore } from '../../store/authStore'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [showCreateApp, setShowCreateApp] = useState(false)
  const [showCreateApiKey, setShowCreateApiKey] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const toast = useToast()
  const queryClient = useQueryClient()
  const { organization } = useAuthStore()

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'organizations', label: 'Organizations' },
    { id: 'applications', label: 'Applications' },
    { id: 'environments', label: 'Environments' },
    { id: 'api-keys', label: 'API Keys' },
    { id: 'users', label: 'Users' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'rbac', label: 'RBAC' },
  ]

  // Organizations
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationsApi.list(),
    retry: 1,
  })

  const createOrgMutation = useMutation({
    mutationFn: (data: { name: string; slug?: string }) => organizationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setShowCreateOrg(false)
      toast.success('Organization created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create organization: ' + error.message)
    },
  })

  // Applications
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.list(),
    retry: 1,
  })

  const createAppMutation = useMutation({
    mutationFn: (data: { name: string }) => applicationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      setShowCreateApp(false)
      toast.success('Application created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create application: ' + error.message)
    },
  })

  // API Keys
  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['api-keys', organization?.id],
    queryFn: () => {
      if (!organization?.id) {
        return Promise.resolve([])
      }
      return organizationsApi.listApiKeys(organization.id)
    },
    retry: 1,
  })

  const createApiKeyMutation = useMutation({
    mutationFn: (data: { name: string; scopes?: string[]; expires_at?: string }) =>
      organizationsApi.createApiKey(organization?.id || '', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setNewApiKey(data.key)
      setShowCreateApiKey(false)
      toast.success('API key created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create API key: ' + error.message)
    },
  })

  const revokeApiKeyMutation = useMutation({
    mutationFn: (keyId: string) => organizationsApi.revokeApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key revoked successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to revoke API key: ' + error.message)
    },
  })

  // Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users', organization?.id],
    queryFn: () => {
      if (!organization?.id) {
        return Promise.resolve([])
      }
      return organizationsApi.listUsers(organization.id)
    },
    retry: 1,
  })

  const createUserMutation = useMutation({
    mutationFn: (data: { email: string; name?: string; role?: 'admin' | 'member' | 'viewer' }) =>
      organizationsApi.createUser(organization?.id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowCreateUser(false)
      toast.success('User created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create user: ' + error.message)
    },
  })

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast.success('API key copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your Guardrails Platform
        </p>
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
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Platform Name"
                defaultValue="Guardrails Platform"
                fullWidth
              />
              {organization && (
                <Input
                  label="Current Organization"
                  defaultValue={organization.name}
                  fullWidth
                  disabled
                />
              )}
              <Button icon={<Save className="w-4 h-4" />}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'organizations' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Organizations</CardTitle>
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateOrg(true)}>
                Create Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="text-center py-8">
                <Spinner />
              </div>
            ) : (
              <Table
                data={organizations || []}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'slug', header: 'Slug' },
                  {
                    key: 'created_at',
                    header: 'Created',
                    render: (org) => formatDateTime(org.created_at),
                  },
                ]}
                emptyMessage="No organizations found"
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'applications' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Applications</CardTitle>
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateApp(true)}>
                Create Application
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {appsLoading ? (
              <div className="text-center py-8">
                <Spinner />
              </div>
            ) : (
              <Table
                data={applications || []}
                columns={[
                  { key: 'name', header: 'Name' },
                  {
                    key: 'created_at',
                    header: 'Created',
                    render: (app) => formatDateTime(app.created_at),
                  },
                ]}
                emptyMessage="No applications found"
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'api-keys' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateApiKey(true)}>
                Generate New Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {newApiKey && (
              <div className="mb-4 p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
                <p className="text-sm font-medium text-success-800 dark:text-success-300 mb-2">
                  ⚠️ Save this API key now. You won't be able to see it again!
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 rounded border font-mono text-sm">
                    {newApiKey}
                  </code>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Copy className="w-4 h-4" />}
                    onClick={() => handleCopyApiKey(newApiKey)}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
            {apiKeysLoading ? (
              <div className="text-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4">
                {(apiKeys || []).map((key: any) => (
                <div key={key.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{key.name}</span>
                      <span className="ml-2 font-mono text-sm text-gray-600 dark:text-gray-400">
                        {key.key_prefix}•••••••
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={key.last_used_at ? 'success' : 'default'}>
                        {key.last_used_at ? 'Active' : 'Never Used'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => {
                          if (confirm('Are you sure you want to revoke this API key?')) {
                            revokeApiKeyMutation.mutate(key.id)
                          }
                        }}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Created {formatDateTime(key.created_at)}
                    {key.last_used_at && ` • Last used ${formatDateTime(key.last_used_at)}`}
                    {key.expires_at && ` • Expires ${formatDateTime(key.expires_at)}`}
                  </p>
                </div>
              ))}
              {(!apiKeys || apiKeys.length === 0) && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No API keys found. Create one to get started.
                </p>
              )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateUser(true)}>
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="text-center py-8">
                <Spinner />
              </div>
            ) : (
              <Table
                data={users || []}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'email', header: 'Email' },
                  {
                    key: 'role',
                    header: 'Role',
                    render: (user) => <Badge variant="info">{user.role}</Badge>,
                  },
                  {
                    key: 'created_at',
                    header: 'Created',
                    render: (user) => formatDateTime(user.created_at),
                  },
                ]}
                emptyMessage="No users found"
              />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'rbac' && (
        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { role: 'admin', description: 'Full access to all features', users: (users || [])?.filter((u: any) => u.role === 'admin').length || 0 },
                { role: 'member', description: 'Policies + Audit (read-only)', users: (users || [])?.filter((u: any) => u.role === 'member').length || 0 },
                { role: 'viewer', description: 'Read-only + Sandbox', users: (users || [])?.filter((u: any) => u.role === 'viewer').length || 0 },
              ].map((item) => (
                <div
                  key={item.role}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                        {item.role}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <Badge>{item.users} users</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Slack Webhook
                </h4>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  fullWidth
                />
              </div>
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  Email Notifications
                </h4>
                <Input
                  type="email"
                  placeholder="security@company.com"
                  fullWidth
                />
              </div>
              <Button icon={<Save className="w-4 h-4" />}>Save Alert Settings</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Organization Modal */}
      <Modal
        isOpen={showCreateOrg}
        onClose={() => setShowCreateOrg(false)}
        title="Create Organization"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createOrgMutation.mutate({
              name: formData.get('name') as string,
              slug: formData.get('slug') as string || undefined,
            })
          }}
          className="space-y-4"
        >
          <Input label="Name" name="name" required fullWidth />
          <Input label="Slug (optional)" name="slug" fullWidth />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreateOrg(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createOrgMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Application Modal */}
      <Modal
        isOpen={showCreateApp}
        onClose={() => setShowCreateApp(false)}
        title="Create Application"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createAppMutation.mutate({
              name: formData.get('name') as string,
            })
          }}
          className="space-y-4"
        >
          <Input label="Name" name="name" required fullWidth />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreateApp(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createAppMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create API Key Modal */}
      <Modal
        isOpen={showCreateApiKey}
        onClose={() => {
          setShowCreateApiKey(false)
          setNewApiKey(null)
        }}
        title="Generate API Key"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createApiKeyMutation.mutate({
              name: formData.get('name') as string,
              expires_at: formData.get('expires_at') ? new Date(formData.get('expires_at') as string).toISOString() : undefined,
              scopes: formData.get('scopes') ? (formData.get('scopes') as string).split(',').map(s => s.trim()) : undefined,
            })
          }}
          className="space-y-4"
        >
          <Input label="Key Name" name="name" required fullWidth />
          <Input
            label="Expires At (optional)"
            name="expires_at"
            type="datetime-local"
            fullWidth
          />
          <Input
            label="Scopes (comma-separated, default: read, write)"
            name="scopes"
            type="text"
            placeholder="read, write"
            fullWidth
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => {
              setShowCreateApiKey(false)
              setNewApiKey(null)
            }}>
              Cancel
            </Button>
            <Button type="submit" loading={createApiKeyMutation.isPending}>
              Generate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
        title="Add User"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createUserMutation.mutate({
              email: formData.get('email') as string,
              name: formData.get('name') as string,
              role: formData.get('role') as 'admin' | 'security' | 'developer',
            })
          }}
          className="space-y-4"
        >
          <Input label="Name" name="name" required fullWidth />
          <Input label="Email" name="email" type="email" required fullWidth />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              name="role"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="developer">Developer</option>
              <option value="security">Security</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={() => setShowCreateUser(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createUserMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
