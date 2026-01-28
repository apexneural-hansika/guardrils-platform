// Application Types (matching backend/app/schemas/app.py)

export interface Application {
  id: string
  org_id: string
  name: string
  slug: string
  description?: string
  owners: string[]
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AppCreate {
  name: string
  slug?: string
  description?: string
  settings?: Record<string, any>
}

export interface AppUpdate {
  name?: string
  description?: string
  settings?: Record<string, any>
}

export interface AppResponse {
  id: string
  org_id: string
  name: string
  slug: string
  description?: string
  owners: string[]
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Environment {
  id: string
  app_id: string
  name: 'dev' | 'staging' | 'prod'
  is_production: boolean
  settings: Record<string, any>
  created_at: string
}

export interface EnvironmentCreate {
  name: 'dev' | 'staging' | 'prod'
  is_production?: boolean
  settings?: Record<string, any>
}

export interface EnvironmentResponse {
  id: string
  app_id: string
  name: 'dev' | 'staging' | 'prod'
  is_production: boolean
  settings: Record<string, any>
  created_at: string
}
