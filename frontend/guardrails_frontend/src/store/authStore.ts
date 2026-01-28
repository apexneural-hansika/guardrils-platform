import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Organization, Environment } from '../types/common'

interface AuthState {
  user: User | null
  token: string | null
  organization: Organization | null
  environment: Environment
  isAuthenticated: boolean
  
  // Actions
  login: (user: User, token: string) => void
  logout: () => void
  setOrganization: (org: Organization) => void
  setEnvironment: (env: Environment) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      organization: null,
      environment: { id: 'dev', name: 'Development', slug: 'dev', color: 'bg-blue-500' },
      isAuthenticated: false,

      login: (user, token, organization) => {
        localStorage.setItem('auth_token', token)
        set({ 
          user, 
          token, 
          organization: organization || null,
          isAuthenticated: true 
        })
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('api_key')
        set({ user: null, token: null, organization: null, isAuthenticated: false })
      },

      setOrganization: (org) => {
        set({ organization: org })
      },

      setEnvironment: (env) => {
        set({ environment: env })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        organization: state.organization,
        environment: state.environment,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
