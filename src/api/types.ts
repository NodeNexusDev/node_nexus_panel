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
  username?: string | null
  password?: string | null
  ssh_key?: string | null
  passphrase?: string | null
  docker_host?: string | null
  tags?: string[]
}

export interface NodeUpdate {
  name?: string | null
  host?: string | null
  port?: number | null
  connection_type?: ConnectionType | null
  status?: NodeStatus | null
  username?: string | null
  password?: string | null
  ssh_key?: string | null
  passphrase?: string | null
  docker_host?: string | null
  tags?: string[] | null
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
  type?: 'string' | 'integer' | 'boolean'
  required?: boolean
  default?: unknown
  description?: string | null
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
  description?: string | null
  command: string
  parameters?: CommandParameter[]
  tags?: string[]
}

export interface CommandUpdate {
  name?: string | null
  description?: string | null
  command?: string | null
  parameters?: CommandParameter[] | null
  tags?: string[] | null
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
  command?: string | null
  command_id?: string | null
  params?: Record<string, unknown>
  on_failure?: 'stop' | 'continue'
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
  description?: string | null
  steps: ScriptStep[]
  tags?: string[]
}

export interface ScriptUpdate {
  name?: string | null
  description?: string | null
  steps?: ScriptStep[] | null
  tags?: string[] | null
}

export interface ScriptExecuteRequest {
  node_ids?: string[] | null
  node_tags?: string[] | null
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
  node_id?: string | null
  user?: string | null
  details?: string | null
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
  avg_duration_ms?: number | null
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
  name?: string | null
  scope?: 'read-only' | 'read-write' | null
  is_active?: boolean | null
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
  avg_duration_ms?: number | null
  min_duration_ms?: number | null
  max_duration_ms?: number | null
  last_executed_at?: string | null
}

export interface NodeStatusHistoryItem {
  id: string
  node_id?: string | null
  old_status?: string | null
  new_status: string
  source: string
  changed_at: string
}

export interface ExecutionRetryResponse {
  execution_id: string
  status: string
  message: string
}

export interface NodeValidateRequest {
  host: string
  port?: number
  connection_type?: ConnectionType
  username?: string | null
  password?: string | null
  ssh_key?: string | null
  passphrase?: string | null
}

export interface NodeValidateResponse {
  status: NodeStatus
  message: string
}

export interface BulkCommandHistoryItem {
  id: string
  node_id?: string | null
  command_fingerprint: string
  exit_code: number
  stdout: string
  stderr: string
  stdout_bytes: number
  stderr_bytes: number
  truncated: boolean
  batch_id?: string | null
  started_at: string
  finished_at?: string | null
  created_at: string
}

export interface BulkNodeOperationResult {
  affected: number
  node_ids: string[]
}

export interface BulkNodeResult {
  node_id: string
  node_name: string
  stdout: string
  stderr: string
  exit_code: number
}

export interface BulkCommandResult {
  command: string
  results: BulkNodeResult[]
  total: number
  succeeded: number
  failed: number
}

export interface ScriptExecutionResponse {
  id: string
  script_id: string
  node_id: string | null
  params: Record<string, unknown> | null
  status: string
  steps: ScriptStepResult[] | null
  started_at: string
  finished_at: string | null
}

// ── Phase 2: Docker ─────────────────────────────────────────────

// ── Docker: Container types (backend OpenAPI) ────────────────────

export interface DockerContainer {
  ID: string
  Names: string
  Image: string
  Command: string
  CreatedAt: string
  State: string
  Status: string
  Ports?: string | null
  Networks?: string | null
}

export interface DockerContainerInspect {
  Id: string
  Name: string
  State: DockerContainerState
  Config: DockerContainerConfig
  NetworkSettings?: Record<string, unknown>
}

export interface DockerContainerState {
  status: string
  running: boolean
  exit_code: number
  started_at?: string | null
  finished_at?: string | null
  oom_killed?: boolean | null
}

export interface DockerContainerConfig {
  cmd?: string[] | null
  hostname?: string | null
  image?: string | null
}

export interface ContainerVolumeMount {
  bind: string
  mode?: 'rw' | 'ro'
}

export interface DockerCreateContainerRequest {
  image: string
  name?: string | null
  command?: string | null
  detach?: boolean
  env?: string[]
  labels?: Record<string, string>
  network?: string | null
  ports?: Record<string, string>
  restart_policy?: string | null
  volumes?: Record<string, ContainerVolumeMount>
}

export interface ContainerCreatedResponse {
  id: string
  name: string
  image: string
  status: string
}

export interface DockerExecRequest {
  command: string
  timeout?: number
}

export interface DockerExecResult {
  stdout: string
  stderr: string
  exit_code: number
}

export interface DockerContainerStats {
  Container: string
  Name: string
  CPUPerc: string
  MemUsage: string
  MemPerc: string
  NetIO: string
  BlockIO: string
  MemLimit?: string | null
  PIDs?: string | null
}

// ── Docker: Image types ──────────────────────────────────────────

export interface DockerImage {
  Repository: string
  Tag: string
  ID: string
  Size: string
  CreatedAt: string
}

export interface DockerImagePullRequest {
  image: string
  timeout?: number
}

export interface DockerPullResult {
  image: string
  output: string
  success: boolean
}

export interface DockerImageBuildRequest {
  dockerfile: string
  tag: string
  build_args?: Record<string, string>
  no_cache?: boolean
}

export interface DockerImageBuildResponse {
  image_id: string
  tag: string
  output: string
}

export interface DockerImageTagRequest {
  repo: string
  tag: string
}

export interface DockerImageTagResponse {
  source: string
  target: string
}

export interface DockerImageInspectResponse {
  id: string
  architecture?: string
  created?: string
  os?: string
  repo_tags?: string[]
  size?: number
}

// ── Docker: Network & Volume types ───────────────────────────────

export interface DockerNetwork {
  ID: string
  Name: string
  Driver: string
  Scope: string
}

export interface DockerVolume {
  Name: string
  Driver: string
}

// ── Docker: Bulk types ───────────────────────────────────────────

export interface BulkDockerRequest {
  container_id: string
  command?: string | null
  node_ids?: string[]
  node_tags?: string[]
  timeout?: number | null
}

export interface BulkDockerResponse {
  action: string
  results: BulkDockerNodeResult[]
  total: number
  succeeded: number
  failed: number
}

export interface BulkDockerNodeResult {
  node_id: string
  node_name: string
  status: string
  output?: string
  error?: string
}

// ── Docker: Logs (plain string from backend) ────────────────────

// Logs endpoint returns plain text string

// ── Phase 3: Audit + Search + Favorites ─────────────────────────

export interface AuditLog {
  id: string
  action: string
  node_id: string | null
  user: string | null
  details: string | null
  created_at: string
}

export interface SearchResultItem {
  id: string
  name: string
  entity_type: string
}

export interface GlobalSearchResponse {
  nodes: SearchResultItem[]
  commands: SearchResultItem[]
  scripts: SearchResultItem[]
  tags: string[]
}

export interface Favorite {
  id: string
  target_type: 'node' | 'command' | 'script'
  target_id: string
  note: string | null
  created_at: string
}

export interface FavoriteCreate {
  target_type: 'node' | 'command' | 'script'
  target_id: string
  note?: string | null
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
  target_type: 'node' | 'command' | 'script'
  target_id: string
  content: string
}

export interface NoteUpdate {
  content: string
}

export interface Tag {
  name: string
  count: number
}

// ── Settings: API Keys ──────────────────────────────────────────

export interface ApiKeyList {
  items: ApiKey[]
  total: number
}

// ── Config: Export/Import ───────────────────────────────────────

export interface ConfigExport {
  exported_at: string
  format_version?: string
  version?: string
  application_version?: string
  nodes?: NodeExport[]
  commands?: CommandExport[]
  scripts?: ScriptExport[]
}

export interface NodeExport {
  name: string
  host: string
  port: number
  connection_type: string
  tags?: string[]
  username?: string | null
}

export interface CommandExport {
  name: string
  command: string
  description?: string | null
  parameters?: CommandParameter[] | null
  tags?: string[]
}

export interface ScriptExport {
  name: string
  description?: string
  steps?: ScriptStep[]
  tags?: string[]
}

export interface ConfigImport {
  exported_at?: string
  format_version?: string | null
  version?: string | null
  application_version?: string | null
  nodes?: NodeExport[]
  commands?: CommandExport[]
  scripts?: ScriptExport[]
  dry_run?: boolean
}

export interface ImportResult {
  nodes_created?: number
  commands_created?: number
  scripts_created?: number
  errors?: string[]
}

// ── Config: Dry Run Import ──────────────────────────────────────

export interface DryRunImportResult {
  dry_run?: boolean
  would_create?: DryRunWouldCreate
  duplicates?: string[]
  errors?: string[]
}

export interface DryRunWouldCreate {
  nodes?: DryRunNodePreview[]
  commands?: DryRunCommandPreview[]
  scripts?: DryRunScriptPreview[]
}

export interface DryRunNodePreview {
  name: string
  host: string
  port: number
  connection_type: string
  tags?: string[]
  username?: string | null
}

export interface DryRunCommandPreview {
  name: string
  command: string
  description?: string | null
  tags?: string[]
}

export interface DryRunScriptPreview {
  name: string
  description?: string | null
  tags?: string[]
}

// ── Scripts: Schedule types ─────────────────────────────────────

export interface ScheduledJob {
  id: string
  script_id: string
  cron: string
  timezone: string
  enabled: boolean
  misfire_grace_seconds: number
  operational_state: string
  next_run_at?: string | null
  last_run_at?: string | null
  last_success_at?: string | null
  last_failure_at?: string | null
  last_error_type?: string | null
  node_ids?: string[]
  params?: Record<string, unknown>
}

export interface ScheduleRequest {
  cron: string
  node_ids: string[]
  params?: Record<string, unknown>
  timezone?: string
  misfire_grace_seconds?: number
}

export interface ScheduleResponse {
  script_id: string
  cron: string
  message?: string
  timezone?: string
}

export interface ScriptNodeResult {
  execution_id: string
  node_id: string
  node_name: string
  status: string
  steps: ScriptStepResult[]
}

export interface ScriptStepResult {
  step_index: number
  label: string
  command_fingerprint: string
  stdout: string
  stderr: string
  stdout_bytes: number
  stderr_bytes: number
  exit_code: number
  truncated?: boolean
}

export interface ScriptExecutionBatchResult {
  script_id: string
  results: ScriptNodeResult[]
}

// ── Commands: History ───────────────────────────────────────────

export interface CommandHistoryResponse {
  id: string
  command_fingerprint: string
  exit_code: number
  stdout: string
  stderr: string
  stdout_bytes: number
  stderr_bytes: number
  truncated: boolean
  started_at: string
  finished_at: string | null
  created_at: string
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
