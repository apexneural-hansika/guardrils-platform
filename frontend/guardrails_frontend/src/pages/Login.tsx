import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { organizationsApi } from '../api/organizations'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import Alert from '../components/common/Alert'
import { useToast } from '../hooks/useToast'
import { LogIn, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const toast = useToast()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgSlug, setOrgSlug] = useState('')
  const [showOrgInput, setShowOrgInput] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableOrgs, setAvailableOrgs] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [loadingOrgs, setLoadingOrgs] = useState(false)

  // Load organizations when user types email (optional - for better UX)
  const handleEmailChange = async (value: string) => {
    setEmail(value)
    setError(null)
    
    // If email looks valid and org slug is empty, try to find organizations
    if (value.includes('@') && !orgSlug) {
      setLoadingOrgs(true)
      try {
        // Note: This would require a backend endpoint to search orgs by user email
        // For now, we'll just show the org input option
        setShowOrgInput(true)
      } catch (err) {
        // Ignore errors - org lookup is optional
      } finally {
        setLoadingOrgs(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const loginData: any = {
        email,
        password,
      }

      // Add org identifier if provided
      if (orgSlug) {
        loginData.org_slug = orgSlug
      }

      const response = await authApi.login(loginData)

      // Store auth data
      login(
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.user.email.split('@')[0],
          role: response.user.role as 'admin' | 'member' | 'viewer',
        },
        response.access_token,
        {
          id: response.organization.id,
          name: response.organization.name,
          slug: response.organization.slug,
        }
      )

      toast.success(`Welcome back, ${response.user.name || response.user.email}!`)
      navigate('/overview')
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sign In
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Enter your credentials to access your organization
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="you@example.com"
            required
            fullWidth
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            fullWidth
          />

          {/* Organization Slug (optional) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Organization (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowOrgInput(!showOrgInput)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showOrgInput ? 'Hide' : 'Specify organization'}
              </button>
            </div>
            {showOrgInput && (
              <Input
                type="text"
                value={orgSlug}
                onChange={(e) => setOrgSlug(e.target.value)}
                placeholder="organization-slug"
                fullWidth
                helpText="If you belong to multiple organizations, specify which one to log into"
              />
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Leave empty if you only belong to one organization
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
            icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/landing"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact your administrator
            </Link>
          </p>
        </div>
      </Card>

      <div className="mt-4 text-center">
        <Link
          to="/landing"
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

