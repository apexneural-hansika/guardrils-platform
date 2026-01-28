import { useAuthStore } from '../store/authStore'
import { User, Organization, Environment } from '../types/common'

export function useAuth() {
  const {
    user,
    token,
    organization,
    environment,
    isAuthenticated,
    login,
    logout,
    setOrganization,
    setEnvironment,
    updateUser,
  } = useAuthStore()

  const handleLogin = async (email: string, password: string, orgSlug?: string): Promise<boolean> => {
    try {
      const { authApi } = await import('../api/auth')
      const response = await authApi.login({
        email,
        password,
        org_slug: orgSlug,
      })
      
      login(
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || email.split('@')[0],
          role: response.user.role as 'admin' | 'member' | 'viewer',
        },
        response.access_token,
        {
          id: response.organization.id,
          name: response.organization.name,
          slug: response.organization.slug,
        }
      )
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const handleLogout = () => {
    logout()
    // Navigation will be handled by the component calling this
  }

  const switchOrganization = (org: Organization) => {
    setOrganization(org)
  }

  const switchEnvironment = (env: Environment) => {
    setEnvironment(env)
  }

  return {
    user,
    token,
    organization,
    environment,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    switchOrganization,
    switchEnvironment,
    updateUser,
  }
}
