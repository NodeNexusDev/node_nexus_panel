export interface Node {
  id: string
  name: string
  status: 'online' | 'offline' | 'connecting'
  ip: string
  os: string
  cpu: string
  memory: string
  lastSeen: string
  agentVersion?: string
}

export interface NodeStats {
  totalNodes: number
  online: number
  offline: number
  commandsToday: number
}

export interface Command {
  id: string
  command: string
  node: string
  nodeId: string
  status: 'success' | 'error' | 'running'
  output: string
  timestamp: string
  exitCode?: number
}

export interface CommandExecuteRequest {
  command: string
  nodeId: string
}

export interface Script {
  id: string
  name: string
  description: string
  content?: string
  lastRun: string
  status: 'success' | 'manual' | 'error'
  schedule: string
  createdAt?: string
  updatedAt?: string
}

export interface ScriptCreateRequest {
  name: string
  description: string
  content: string
  schedule?: string
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

export interface AuthResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsedAt?: string
}

export interface NotificationSettings {
  nodeOfflineAlerts: boolean
  commandNotifications: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
