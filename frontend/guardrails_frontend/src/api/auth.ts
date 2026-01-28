import { apiClient } from './client'

export interface LoginRequest {
  email: string
  password: string
  org_slug?: string
  org_id?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
  organization: {
    id: string
    name: string
    slug: string
  }
}

export interface CurrentUserResponse {
  user: {
    id: string
    email: string
    name?: string
    role: string
  }
  organization: {
    id: string
    name: string
    slug: string
  } | null
}

export const authApi = {
  // POST /auth/login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  // GET /auth/me
  getCurrentUser: async (): Promise<CurrentUserResponse> => {
    const response = await apiClient.get<CurrentUserResponse>('/auth/me')
    return response.data
  },
}

