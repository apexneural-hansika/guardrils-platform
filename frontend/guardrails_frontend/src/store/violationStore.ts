import { create } from 'zustand'
import { Violation, ViolationFilters } from '../types/violation'

interface ViolationState {
  violations: Violation[]
  selectedViolation: Violation | null
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  
  // Filters
  filters: ViolationFilters
  
  // Actions
  setViolations: (violations: Violation[]) => void
  addViolations: (violations: Violation[]) => void
  selectViolation: (violation: Violation | null) => void
  setFilters: (filters: ViolationFilters) => void
  clearFilters: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setHasMore: (hasMore: boolean) => void
  setPage: (page: number) => void
  resetPagination: () => void
}

export const useViolationStore = create<ViolationState>((set) => ({
  violations: [],
  selectedViolation: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  filters: {},

  setViolations: (violations) =>
    set({ violations, loading: false, error: null }),

  addViolations: (newViolations) =>
    set((state) => ({
      violations: [...state.violations, ...newViolations],
      loading: false,
      error: null,
    })),

  selectViolation: (violation) => set({ selectedViolation: violation }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1, // Reset page when filters change
      violations: [], // Clear violations when filters change
    })),

  clearFilters: () =>
    set({ filters: {}, page: 1, violations: [], hasMore: true }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error, loading: false }),

  setHasMore: (hasMore) => set({ hasMore }),

  setPage: (page) => set({ page }),

  resetPagination: () =>
    set({ page: 1, violations: [], hasMore: true }),
}))
