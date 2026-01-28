import { create } from 'zustand'
import { Policy } from '../types/policy'

interface PolicyState {
  policies: Policy[]
  selectedPolicy: Policy | null
  loading: boolean
  error: string | null
  
  // Filters
  filters: {
    category?: string
    status?: string
    severity?: string
    search?: string
  }
  
  // Actions
  setPolicies: (policies: Policy[]) => void
  addPolicy: (policy: Policy) => void
  updatePolicy: (id: string, policy: Partial<Policy>) => void
  removePolicy: (id: string) => void
  selectPolicy: (policy: Policy | null) => void
  setFilters: (filters: PolicyState['filters']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearFilters: () => void
}

export const usePolicyStore = create<PolicyState>((set) => ({
  policies: [],
  selectedPolicy: null,
  loading: false,
  error: null,
  filters: {},

  setPolicies: (policies) => set({ policies, loading: false, error: null }),

  addPolicy: (policy) =>
    set((state) => ({ policies: [policy, ...state.policies] })),

  updatePolicy: (id, policyData) =>
    set((state) => ({
      policies: state.policies.map((p) =>
        p.id === id ? { ...p, ...policyData } : p
      ),
      selectedPolicy:
        state.selectedPolicy?.id === id
          ? { ...state.selectedPolicy, ...policyData }
          : state.selectedPolicy,
    })),

  removePolicy: (id) =>
    set((state) => ({
      policies: state.policies.filter((p) => p.id !== id),
      selectedPolicy: state.selectedPolicy?.id === id ? null : state.selectedPolicy,
    })),

  selectPolicy: (policy) => set({ selectedPolicy: policy }),

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  clearFilters: () => set({ filters: {} }),
}))
