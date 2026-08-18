export type ConnectionType = 'ssh' | 'docker' | 'proxmox'
export type NodeStatus = 'active' | 'unreachable' | 'error'

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

export interface Node {
  id: string
  name: string
  host: string
  port: number
  connection_type: ConnectionType
  status: NodeStatus
  username: string | null
  docker_host: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface NodeCreate {
  name: string
  host: string
  port?: number
  connection_type: ConnectionType
  username?: string
  password?: string
  ssh_key?: string
  docker_host?: string
  tags?: string[]
}

export interface NodeUpdate {
  name?: string
  host?: string
  port?: number
  connection_type?: ConnectionType
  status?: NodeStatus
  username?: string
  password?: string
  ssh_key?: string
  docker_host?: string
  tags?: string[]
}

export interface CpuMetrics {
  usage_percent: number
  cores: number
}

export interface MemoryMetrics {
  total_bytes: number
  used_bytes: number
  percent: number
}

export interface DiskMetrics {
  total_bytes: number
  used_bytes: number
  percent: number
}

export interface NodeMetrics {
  cpu: CpuMetrics
  memory: MemoryMetrics
  disk: DiskMetrics
  uptime_since: string
}

export interface CommandParameter {
  name: string
  type: 'string' | 'integer' | 'boolean'
  required: boolean
  default: unknown
  description: string | null
}

export interface Command {
  id: string
  name: string
  description: string | null
  command: string
  parameters: CommandParameter[] | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface CommandCreate {
  name: string
  description?: string
  command: string
  parameters?: CommandParameter[]
  tags?: string[]
}

export interface CommandUpdate {
  name?: string
  description?: string
  command?: string
  parameters?: CommandParameter[]
  tags?: string[]
}

export interface CommandExecuteRequest {
  node_id: string
  params?: Record<string, unknown>
}

export interface CommandResult {
  stdout: string
  stderr: string
  exit_code: number
}

export interface ScriptStep {
  label: string
  type: 'inline' | 'command'
  command: string | null
  command_id: string | null
  params: Record<string, unknown>
  on_failure: 'stop' | 'continue'
}

export interface Script {
  id: string
  name: string
  description: string | null
  steps: ScriptStep[]
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ScriptCreate {
  name: string
  description?: string
  steps: ScriptStep[]
  tags?: string[]
}

export interface ScriptUpdate {
  name?: string
  description?: string
  steps?: ScriptStep[]
  tags?: string[]
}

export interface ScriptExecuteRequest {
  node_ids?: string[]
  node_tags?: string[]
  params?: Record<string, unknown>
}

export interface NodeStats {
  total: number
  active: number
  unreachable: number
}

export interface DockerStats {
  total: number
  running: number
  stopped: number
}

export interface EntityStats {
  total: number
}

export interface RecentActivity {
  id: string
  action: string
  node_id: string | null
  user: string | null
  details: string | null
  created_at: string
}

export interface DashboardResponse {
  nodes: NodeStats
  docker: DockerStats
  scripts: EntityStats
  commands: EntityStats
  recent_activity: RecentActivity[]
}

export interface MetricsBucket {
  period: string
  total: number
  successful: number
  failed: number
  avg_duration_ms: number | null
}

export interface DashboardMetricsResponse {
  command_metrics: MetricsBucket[]
  script_metrics: MetricsBucket[]
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  is_active: boolean
  scope: 'read-only' | 'read-write'
  created_at: string
  last_used_at: string | null
  expires_at: string | null
}

export interface ApiKeyCreate {
  name: string
  scope?: 'read-only' | 'read-write'
}

export interface ApiKeyUpdate {
  name?: string
  scope?: 'read-only' | 'read-write'
  is_active?: boolean
  expires_at?: string | null
}

export interface ApiKeyCreated {
  id: string
  name: string
  key: string
  key_prefix: string
  created_at: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}
