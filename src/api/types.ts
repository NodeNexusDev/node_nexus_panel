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

// ── Phase 1: Nodes + Scripts extensions ──────────────────────────

export interface ExecutionStatsResponse {
  total: number
  successful: number
  failed: number
  success_rate: number
  avg_duration_ms: number | null
  min_duration_ms: number | null
  max_duration_ms: number | null
  last_executed_at: string | null
}

export interface NodeStatusHistoryItem {
  id: string
  node_id: string | null
  old_status: string | null
  new_status: string
  source: string
  changed_at: string
}

export interface ExecutionRetryResponse {
  execution_id: string
  status: string
  message: string
}

export interface NodeValidateResponse {
  status: NodeStatus
  message: string
}

export interface BulkCommandHistoryItem {
  id: string
  node_id: string | null
  command_fingerprint: string
  exit_code: number
  stdout: string
  stderr: string
  stdout_bytes: number
  stderr_bytes: number
  truncated: boolean
  batch_id: string | null
  started_at: string
  finished_at: string | null
  created_at: string
}

export interface BulkNodeOperationResult {
  affected: number
  node_ids: string[]
}

export interface ScriptExecutionResponse {
  id: string
  script_id: string
  node_id: string | null
  params: Record<string, unknown> | null
  status: string
  steps: Record<string, unknown>[] | null
  started_at: string
  finished_at: string | null
}

// ── Phase 2: Docker ─────────────────────────────────────────────

export type DockerContainerState = 'running' | 'stopped' | 'paused' | 'created' | 'restarting'
export type DockerContainerStatus = 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'

export interface DockerContainer {
  id: string
  name: string
  image: string
  state: DockerContainerState
  status: DockerContainerStatus
  created: string
  ports: DockerPort[]
  labels: Record<string, string>
}

export interface DockerPort {
  host_port: number
  container_port: number
  protocol: 'tcp' | 'udp'
}

export interface DockerCreateContainerRequest {
  name: string
  image: string
  ports?: DockerPort[]
  env?: Record<string, string>
  volumes?: string[]
  command?: string[]
  restart_policy?: string
}

export interface DockerExecRequest {
  command: string[]
  working_dir?: string
  user?: string
}

export interface DockerExecResponse {
  output: string
  exit_code: number
}

export interface DockerLogsResponse {
  logs: string
  tail: number
}

export interface DockerImage {
  id: string
  tag: string
  size_bytes: number
  created: string
  labels: Record<string, string>
}

export interface DockerPullImageRequest {
  image: string
  tag?: string
}

export interface DockerBuildImageRequest {
  dockerfile: string
  tag: string
  build_args?: Record<string, string>
}

export interface DockerTagImageRequest {
  repository: string
  tag: string
}

export interface DockerNetwork {
  id: string
  name: string
  driver: string
  created: string
  containers: string[]
}

export interface DockerVolume {
  name: string
  driver: string
  mountpoint: string
  created: string
}

// ── Phase 3: Audit + Search + Favorites ─────────────────────────

export interface AuditLog {
  id: string
  action: string
  resource_type: string
  resource_id: string | null
  user: string | null
  details: string | null
  created_at: string
}

export interface SearchResult {
  id: string
  type: 'node' | 'command' | 'script'
  name: string
  description: string | null
  tags: string[]
  score: number
}

export interface Favorite {
  id: string
  target_type: 'node' | 'command' | 'script'
  target_id: string
  label?: string
  created_at: string
}

export interface FavoriteCreate {
  target_type: 'node' | 'command' | 'script'
  target_id: string
}

// ── Phase 4: Notes + Tags + Config ─────────────────────────────

export interface Note {
  id: string
  target_type: 'node' | 'command' | 'script'
  target_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoteCreate {
  content: string
}

export interface NoteUpdate {
  content: string
}

export interface Tag {
  name: string
  count: number
}

// ── Phase 5: Events SSE ────────────────────────────────────────

export type SseEventType =
  | 'node:status'
  | 'node:metrics'
  | 'command:output'
  | 'command:complete'
  | 'script:complete'
  | 'docker:container:started'
  | 'docker:container:stopped'
  | 'system:alert'

export interface SseEvent {
  type: SseEventType
  payload: unknown
  timestamp: string
}
