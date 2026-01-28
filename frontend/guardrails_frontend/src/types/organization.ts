// Organization Types (matching backend/app/schemas/organization.py)

export interface Organization {
  id: string
  name: string
  slug: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrganizationCreate {
  name: string
  slug?: string
}

export interface OrganizationUpdate {
  name?: string
  settings?: Record<string, any>
}

export interface OrganizationResponse {
  id: string
  name: string
  slug: string
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  org_id: string
  email: string
  name?: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface UserCreate {
  email: string
  name?: string
  role?: 'admin' | 'member' | 'viewer'
}

export interface UserUpdate {
  name?: string
  role?: 'admin' | 'member' | 'viewer'
}

export interface UserResponse {
  id: string
  org_id: string
  email: string
  name?: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface APIKey {
  id: string
  org_id: string
  name: string
  key_prefix: string
  scopes: string[]
  last_used_at?: string
  expires_at?: string
  created_at: string
}

export interface APIKeyCreate {
  name: string
  scopes?: string[]
  expires_at?: string
}

export interface APIKeyCreateResponse {
  id: string
  org_id: string
  name: string
  key: string // Only returned on creation
  key_prefix: string
  scopes: string[]
  expires_at?: string
  created_at: string
}

export interface APIKeyResponse {
  id: string
  org_id: string
  name: string
  key_prefix: string
  scopes: string[]
  last_used_at?: string
  expires_at?: string
  created_at: string
}
