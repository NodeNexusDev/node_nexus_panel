// Auto-synced with OpenAPI 2.0.0 — generated from node_nexus_api/build/openapi.json
// This file re-exports v2 schemas via generated types. Do not edit manually — regenerate via: npx openapi-typescript build/openapi.json -o src/api/__generated/v2.d.ts
import type { components } from './__generated/v2'

// ── Generic helpers ─────────────────────────────────────────────
export type CursorPage<T> = { items: T[]; limit: number; next_cursor: string | null; has_more: boolean; total?: number; page?: number; size?: number }
export type BulkResult<T> = { total: number; succeeded: number; failed: number; results: T[]; items?: T[]; page?: number; size?: number }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; size: number; limit?: number; next_cursor?: string | null; has_more?: boolean } // @deprecated use CursorPage

// ── Re-exports from generated schemas ───────────────────────────
export type APIKeyCreate = Omit<components['schemas']['APIKeyCreate'], 'scope'> & { scope?: "read-only" | "read-write" }
export type APIKeyCreated = components['schemas']['APIKeyCreated']
export type APIKeyList = components['schemas']['APIKeyList']
export type APIKeyResponse = components['schemas']['APIKeyResponse']
export type APIKeyUpdate = components['schemas']['APIKeyUpdate']
export type AuditLogResponse = components['schemas']['AuditLogResponse']
export type BulkCancelCommandResult = components['schemas']['BulkCancelCommandResult']
export type BulkCancelScriptResult = components['schemas']['BulkCancelScriptResult']
export type BulkExecutionBatchResponse = components['schemas']['BulkExecutionBatchResponse']
export type BulkExecutionItem = components['schemas']['BulkExecutionItem']
export type BulkNodeMetricsResult = components['schemas']['BulkNodeMetricsResult']
export type BulkNodeUpdateResult = components['schemas']['BulkNodeUpdateResult']
export type BulkResult_BulkCancelCommandResult_ = components['schemas']['BulkResult_BulkCancelCommandResult_']
export type BulkResult_BulkCancelScriptResult_ = components['schemas']['BulkResult_BulkCancelScriptResult_']
export type BulkResult_BulkNodeMetricsResult_ = components['schemas']['BulkResult_BulkNodeMetricsResult_']
export type BulkResult_BulkNodeUpdateResult_ = components['schemas']['BulkResult_BulkNodeUpdateResult_']
export type BulkResult_BulkRetryCommandResult_ = components['schemas']['BulkResult_BulkRetryCommandResult_']
export type BulkResult_BulkRetryScriptResult_ = components['schemas']['BulkResult_BulkRetryScriptResult_']
export type BulkResult_BulkValidateCredentialsResult_ = components['schemas']['BulkResult_BulkValidateCredentialsResult_']
export type BulkResult_CommandBulkCreateResult_ = components['schemas']['BulkResult_CommandBulkCreateResult_']
export type BulkResult_ComposeServiceBulkResult_ = components['schemas']['BulkResult_ComposeServiceBulkResult_']
export type BulkResult_ContainerBulkResult_ = components['schemas']['BulkResult_ContainerBulkResult_']
export type BulkResult_ContainerExecBulkResult_ = components['schemas']['BulkResult_ContainerExecBulkResult_']
export type BulkResult_ContainerInspectBulkResult_ = components['schemas']['BulkResult_ContainerInspectBulkResult_']
export type BulkResult_ContainerLogsBulkResult_ = components['schemas']['BulkResult_ContainerLogsBulkResult_']
export type BulkResult_ContainerStatsBulkResult_ = components['schemas']['BulkResult_ContainerStatsBulkResult_']
export type BulkResult_ImageBulkResult_ = components['schemas']['BulkResult_ImageBulkResult_']
export type BulkResult_NetworkBulkResult_ = components['schemas']['BulkResult_NetworkBulkResult_']
export type BulkResult_NodeBulkCreateResult_ = components['schemas']['BulkResult_NodeBulkCreateResult_']
export type BulkResult_PackInstallResult_ = components['schemas']['BulkResult_PackInstallResult_']
export type BulkResult_ScriptBulkCreateResult_ = components['schemas']['BulkResult_ScriptBulkCreateResult_']
export type BulkResult_VolumeBulkResult_ = components['schemas']['BulkResult_VolumeBulkResult_']
export type BulkRetryCommandResult = components['schemas']['BulkRetryCommandResult']
export type BulkRetryScriptResult = components['schemas']['BulkRetryScriptResult']
export type BulkScriptExecutionBatchResponse = components['schemas']['BulkScriptExecutionBatchResponse']
export type BulkScriptExecutionItem = components['schemas']['BulkScriptExecutionItem']
export type BulkValidateCredentialsResult = components['schemas']['BulkValidateCredentialsResult']
export type CommandBulkCreateRequest = components['schemas']['CommandBulkCreateRequest']
export type CommandBulkCreateResult = components['schemas']['CommandBulkCreateResult']
export type CommandCreate = components['schemas']['CommandCreate']
export type CommandExecutionsRequest = components['schemas']['CommandExecutionsRequest']
export type CommandExport_Input = components['schemas']['CommandExport-Input']
export type CommandExport_Output = components['schemas']['CommandExport-Output']
export type CommandHistoryResponse = components['schemas']['CommandHistoryResponse']
export type CommandParameter_Input = Omit<components['schemas']['CommandParameter-Input'], 'required' | 'type'> & { required?: boolean; type?: "string" | "integer" | "boolean" }
export type CommandParameter_Output = Omit<components['schemas']['CommandParameter-Output'], 'required' | 'type'> & { required?: boolean; type?: "string" | "integer" | "boolean" }
export type CommandResponse = components['schemas']['CommandResponse']
export type CommandUpdate = components['schemas']['CommandUpdate']
export type ComposeActionResponse = components['schemas']['ComposeActionResponse']
export type ComposeConfigResponse = components['schemas']['ComposeConfigResponse']
export type ComposeCreate = components['schemas']['ComposeCreate']
export type ComposeDownRequest = components['schemas']['ComposeDownRequest']
export type ComposeExecRequest = components['schemas']['ComposeExecRequest']
export type ComposeExecResponse = components['schemas']['ComposeExecResponse']
export type ComposeImagesResponse = components['schemas']['ComposeImagesResponse']
export type ComposeKillRequest = components['schemas']['ComposeKillRequest']
export type ComposeLogsResponse = components['schemas']['ComposeLogsResponse']
export type ComposePortResponse = components['schemas']['ComposePortResponse']
export type ComposePsResponse = components['schemas']['ComposePsResponse']
export type ComposeResponse = components['schemas']['ComposeResponse']
export type ComposeRunRequest = components['schemas']['ComposeRunRequest']
export type ComposeRunResponse = components['schemas']['ComposeRunResponse']
export type ComposeServiceBulkResult = components['schemas']['ComposeServiceBulkResult']
export type ComposeServicesRequest = components['schemas']['ComposeServicesRequest']
export type ComposeTopResponse = components['schemas']['ComposeTopResponse']
export type ComposeUpRequest = components['schemas']['ComposeUpRequest']
export type ComposeUpdate = components['schemas']['ComposeUpdate']
export type ComposeVersionResponse = components['schemas']['ComposeVersionResponse']
export type ConfigExport = components['schemas']['ConfigExport']
export type ConfigImport = components['schemas']['ConfigImport']
export type ConnectionType = components['schemas']['ConnectionType']
export type ContainerBulkResult = components['schemas']['ContainerBulkResult']
export type ContainerCreateRequest = components['schemas']['ContainerCreateRequest']
export type ContainerCreatedResponse = components['schemas']['ContainerCreatedResponse']
export type ContainerExecBulkResult = components['schemas']['ContainerExecBulkResult']
export type ContainerExecutionsRequest = components['schemas']['ContainerExecutionsRequest']
export type ContainerIdsRequest = components['schemas']['ContainerIdsRequest']
export type ContainerInspectBulkResult = components['schemas']['ContainerInspectBulkResult']
export type ContainerInspectionsRequest = components['schemas']['ContainerInspectionsRequest']
export type ContainerKillsRequest = components['schemas']['ContainerKillsRequest']
export type ContainerLogsBulkResult = components['schemas']['ContainerLogsBulkResult']
export type ContainerLogsRequest = components['schemas']['ContainerLogsRequest']
export type ContainerRenameRequest = components['schemas']['ContainerRenameRequest']
export type ContainerStatsBulkResult = components['schemas']['ContainerStatsBulkResult']
export type ContainerStatsRequest = components['schemas']['ContainerStatsRequest']
export type ContainerUpdatesRequest = components['schemas']['ContainerUpdatesRequest']
export type ContainerVolumeMount = Omit<components['schemas']['ContainerVolumeMount'], 'mode'> & { mode?: "rw" | "ro" }
export type CpuMetrics = components['schemas']['CpuMetrics']
export type CredentialValidationsRequest = components['schemas']['CredentialValidationsRequest']
export type CursorPage_AuditLogResponse_ = components['schemas']['CursorPage_AuditLogResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_CommandHistoryResponse_ = components['schemas']['CursorPage_CommandHistoryResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_CommandResponse_ = components['schemas']['CursorPage_CommandResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_ComposeResponse_ = components['schemas']['CursorPage_ComposeResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_DockerContainer_ = components['schemas']['CursorPage_DockerContainer_'] & { total?: number; page?: number; size?: number }
export type CursorPage_DockerImage_ = components['schemas']['CursorPage_DockerImage_'] & { total?: number; page?: number; size?: number }
export type CursorPage_DockerNetwork_ = components['schemas']['CursorPage_DockerNetwork_'] & { total?: number; page?: number; size?: number }
export type CursorPage_DockerVolume_ = components['schemas']['CursorPage_DockerVolume_'] & { total?: number; page?: number; size?: number }
export type CursorPage_FavoriteResponse_ = components['schemas']['CursorPage_FavoriteResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_NodeStatusHistoryItem_ = components['schemas']['CursorPage_NodeStatusHistoryItem_'] & { total?: number; page?: number; size?: number }
export type CursorPage_PackInstallationResponse_ = components['schemas']['CursorPage_PackInstallationResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_PackResponse_ = components['schemas']['CursorPage_PackResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_RegistryResponse_ = components['schemas']['CursorPage_RegistryResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_ScriptExecutionResponse_ = components['schemas']['CursorPage_ScriptExecutionResponse_'] & { total?: number; page?: number; size?: number }
export type CursorPage_ScriptResponse_ = components['schemas']['CursorPage_ScriptResponse_'] & { total?: number; page?: number; size?: number }
export type DiskMetrics = components['schemas']['DiskMetrics']
export type DockerActionResponse = components['schemas']['DockerActionResponse']
export type DockerArchiveResponse = components['schemas']['DockerArchiveResponse']
export type DockerContainer = components['schemas']['DockerContainer']
export type DockerContainerConfig = components['schemas']['DockerContainerConfig']
export type DockerContainerInspect = components['schemas']['DockerContainerInspect']
export type DockerContainerRenameResponse = components['schemas']['DockerContainerRenameResponse']
export type DockerContainerState = components['schemas']['DockerContainerState']
export type DockerExecRequest = Omit<components['schemas']['DockerExecRequest'], 'timeout'> & { timeout?: number }
export type DockerExecResult = components['schemas']['DockerExecResult']
export type DockerImage = components['schemas']['DockerImage']
export type DockerImageBuildRequest = Omit<components['schemas']['DockerImageBuildRequest'], 'no_cache'> & { no_cache?: boolean }
export type DockerImageBuildResponse = components['schemas']['DockerImageBuildResponse']
export type DockerImageHistoryItem = components['schemas']['DockerImageHistoryItem']
export type DockerImageHistoryResponse = components['schemas']['DockerImageHistoryResponse']
export type DockerImageInspectResponse = components['schemas']['DockerImageInspectResponse']
export type DockerImagePullRequest = Omit<components['schemas']['DockerImagePullRequest'], 'timeout'> & { timeout?: number }
export type DockerImagePushRequest = components['schemas']['DockerImagePushRequest']
export type DockerImageTagRequest = components['schemas']['DockerImageTagRequest']
export type DockerImageTagResponse = components['schemas']['DockerImageTagResponse']
export type DockerNetwork = components['schemas']['DockerNetwork']
export type DockerNetworkCreateResponse = components['schemas']['DockerNetworkCreateResponse']
export type DockerPortResponse = components['schemas']['DockerPortResponse']
export type DockerPruneResponse = components['schemas']['DockerPruneResponse']
export type DockerPullResult = components['schemas']['DockerPullResult']
export type DockerStats = components['schemas']['DockerStats']
export type DockerSystemDfItem = components['schemas']['DockerSystemDfItem']
export type DockerSystemInfo = components['schemas']['DockerSystemInfo']
export type DockerTopResult = components['schemas']['DockerTopResult']
export type DockerVersionResponse = components['schemas']['DockerVersionResponse']
export type DockerVolume = components['schemas']['DockerVolume']
export type DockerVolumeCreateResponse = components['schemas']['DockerVolumeCreateResponse']
export type DockerVolumePruneResponse = components['schemas']['DockerVolumePruneResponse']
export type DockerWaitResponse = components['schemas']['DockerWaitResponse']
export type DryRunCommandPreview = components['schemas']['DryRunCommandPreview']
export type DryRunImportResult = components['schemas']['DryRunImportResult']
export type DryRunNodePreview = components['schemas']['DryRunNodePreview']
export type DryRunScriptPreview = components['schemas']['DryRunScriptPreview']
export type DryRunWouldCreate = components['schemas']['DryRunWouldCreate']
export type ErrorResponse = components['schemas']['ErrorResponse']
export type ExecutionCancelsRequest = components['schemas']['ExecutionCancelsRequest']
export type ExecutionRetriesRequest = components['schemas']['ExecutionRetriesRequest']
export type FavoriteCreate = components['schemas']['FavoriteCreate']
export type FavoriteResponse = components['schemas']['FavoriteResponse']
export type GlobalSearchResponse = components['schemas']['GlobalSearchResponse']
export type HTTPValidationError = components['schemas']['HTTPValidationError']
export type ImageBulkResult = components['schemas']['ImageBulkResult']
export type ImagePullsRequest = components['schemas']['ImagePullsRequest']
export type ImageRemovalsRequest = components['schemas']['ImageRemovalsRequest']
export type ImportResult = components['schemas']['ImportResult']
export type JsonObject_Input = components['schemas']['JsonObject-Input']
export type JsonObject_Output = components['schemas']['JsonObject-Output']
export type JsonScalar = components['schemas']['JsonScalar']
export type JsonValue_Input = components['schemas']['JsonValue-Input']
export type JsonValue_Output = components['schemas']['JsonValue-Output']
export type KillRequest = components['schemas']['KillRequest']
export type LoadAverage = components['schemas']['LoadAverage']
export type LoginRequest = components['schemas']['LoginRequest']
export type MemoryMetrics = components['schemas']['MemoryMetrics']
export type NetworkBulkResult = components['schemas']['NetworkBulkResult']
export type NetworkConnectRequest = components['schemas']['NetworkConnectRequest']
export type NetworkCreateRequest = components['schemas']['NetworkCreateRequest']
export type NetworkDisconnectRequest = Omit<components['schemas']['NetworkDisconnectRequest'], 'force'> & { force?: boolean }
export type NetworkInspectContainer = components['schemas']['NetworkInspectContainer']
export type NetworkInspectResponse = components['schemas']['NetworkInspectResponse']
export type NetworkRemovalsRequest = components['schemas']['NetworkRemovalsRequest']
export type NodeBulkCreateRequest = components['schemas']['NodeBulkCreateRequest']
export type NodeBulkCreateResult = components['schemas']['NodeBulkCreateResult']
export type NodeBulkUpdateItem = components['schemas']['NodeBulkUpdateItem']
export type NodeBulkUpdatesRequest = components['schemas']['NodeBulkUpdatesRequest']
export type NodeChecksRequest = components['schemas']['NodeChecksRequest']
export type NodeCreate = Omit<components['schemas']['NodeCreate'], 'has_docker' | 'port' | 'connection_type'> & { has_docker?: boolean; port?: number; connection_type?: ConnectionType }
export type NodeCursorListResponse = components['schemas']['NodeCursorListResponse'] & { total?: number; page?: number; size?: number }
export type NodeDeletionsRequest = components['schemas']['NodeDeletionsRequest']
export type NodeExport = components['schemas']['NodeExport']
export type NodeMetrics = components['schemas']['NodeMetrics']
export type NodeMetricsRequest = components['schemas']['NodeMetricsRequest']
export type NodeResponse = components['schemas']['NodeResponse']
export type NodeStatus = components['schemas']['NodeStatus']
export type NodeStatusHistoryItem = components['schemas']['NodeStatusHistoryItem']
export type NodeUpdate = components['schemas']['NodeUpdate']
export type PackAssetCreateRequest = components['schemas']['PackAssetCreateRequest']
export type PackAssetResponse = components['schemas']['PackAssetResponse']
export type PackDetailWithAssetsResponse = components['schemas']['PackDetailWithAssetsResponse']
export type PackInstallResult = components['schemas']['PackInstallResult']
export type PackInstallationResponse = components['schemas']['PackInstallationResponse']
export type PackLocalCreateRequest = components['schemas']['PackLocalCreateRequest']
export type PackManifestRequest = components['schemas']['PackManifestRequest']
export type PackResponse = components['schemas']['PackResponse']
export type PackStatsResponse = components['schemas']['PackStatsResponse']
export type RawExecutionsRequest = components['schemas']['RawExecutionsRequest']
export type ReadyCheck = components['schemas']['ReadyCheck']
export type ReadyResponse = components['schemas']['ReadyResponse']
export type RegistryCreate = components['schemas']['RegistryCreate']
export type RegistryResponse = components['schemas']['RegistryResponse']
export type RegistrySyncItem = components['schemas']['RegistrySyncItem']
export type RegistrySyncResult = components['schemas']['RegistrySyncResult']
export type ScheduleRequest = components['schemas']['ScheduleRequest']
export type ScheduleResponse = components['schemas']['ScheduleResponse']
export type ScheduledJob = components['schemas']['ScheduledJob']
export type ScriptBulkCreateRequest = components['schemas']['ScriptBulkCreateRequest']
export type ScriptBulkCreateResult = components['schemas']['ScriptBulkCreateResult']
export type ScriptCreate = components['schemas']['ScriptCreate']
export type ScriptExecutionResponse = components['schemas']['ScriptExecutionResponse']
export type ScriptExecutionsRequest = components['schemas']['ScriptExecutionsRequest']
export type ScriptExport_Input = components['schemas']['ScriptExport-Input']
export type ScriptExport_Output = components['schemas']['ScriptExport-Output']
export type ScriptResponse = components['schemas']['ScriptResponse']
export type ScriptStep_Input = Omit<components['schemas']['ScriptStep-Input'], 'on_failure'> & { on_failure?: "stop" | "continue" }
export type ScriptStep_Output = Omit<components['schemas']['ScriptStep-Output'], 'on_failure'> & { on_failure?: "stop" | "continue" }
export type ScriptStepResult = components['schemas']['ScriptStepResult']
export type ScriptUpdate = components['schemas']['ScriptUpdate']
export type SearchResultItem = components['schemas']['SearchResultItem']
export type StatsBucket = components['schemas']['StatsBucket']
export type TokenResponse = components['schemas']['TokenResponse']
export type UpdateRequest = components['schemas']['UpdateRequest']
export type UserCreate = Omit<components['schemas']['UserCreate'], 'is_superuser'> & { is_superuser?: boolean }
export type UserListResponse = components['schemas']['UserListResponse']
export type UserResponse = components['schemas']['UserResponse']
export type ValidationError = components['schemas']['ValidationError']
export type VolumeBulkResult = components['schemas']['VolumeBulkResult']
export type VolumeCreateRequest = components['schemas']['VolumeCreateRequest']
export type VolumeInspectResponse = components['schemas']['VolumeInspectResponse']
export type VolumeRemovalsRequest = components['schemas']['VolumeRemovalsRequest']

// ── Friendly aliases (panel legacy names → v2) ──────────────────
export type Node = components['schemas']['NodeResponse']
export type ApiKeyCreate = Omit<components['schemas']['APIKeyCreate'], 'scope'> & { scope?: "read-only" | "read-write" }
export type ApiKeyUpdate = components['schemas']['APIKeyUpdate']
export type ApiKeyCreated = components['schemas']['APIKeyCreated']
export type APIKeyListResponse = components['schemas']['APIKeyList']

// ── Dashes sanitized aliases ────────────────────────────────────
export type CommandParameter = CommandParameter_Output // legacy unified
export type ScriptStep = ScriptStep_Output

// ── Helpers ─────────────────────────────────────────────────────
export type NodeOffsetListResponse = { items: Node[]; total: number; page: number; size: number } // legacy
export type NodeListResponse = NodeCursorListResponse | NodeOffsetListResponse
export function isNodeCursorResponse(resp: NodeListResponse): resp is NodeCursorListResponse { return 'next_cursor' in (resp as any) && 'has_more' in (resp as any) }

export interface ApiError { code: string; message: string; detail?: unknown; request_id?: string | null; details?: Record<string, string[]> }

// ── Panel-specific extensions (not in spec, kept for UI) ────────
export interface NodeStats { total: number; active: number; unreachable: number }
export interface DashboardDockerStats { total: number; running: number; stopped: number }
export interface EntityStats { total: number }
export interface RecentActivity { id: string; action: string; node_id?: string | null; user?: string | null; details?: string | null; created_at: string }
export interface DashboardResponse { nodes: NodeStats; docker: DashboardDockerStats; scripts: EntityStats; commands: EntityStats; recent_activity: RecentActivity[] }
export interface MetricsBucket { period: string; total: number; successful: number; failed: number; cancelled?: number; avg_duration_ms?: number | null }
export interface DashboardMetricsResponse { command_metrics: MetricsBucket[]; script_metrics: MetricsBucket[] }
export interface NoteResponse { id: string; target_type: 'node' | 'command' | 'script'; target_id: string; content: string; created_at: string; updated_at: string }
export interface NoteCreate { target_type: 'node' | 'command' | 'script'; target_id: string; content: string }
export interface NoteUpdate { content: string }

// ── Stats compatibility ─────────────────────────────────────────
export type ExecutionStatsResponse = { total: number; successful: number; failed: number; cancelled?: number; success_rate: number; avg_duration_ms?: number | null; min_duration_ms?: number | null; max_duration_ms?: number | null; last_executed_at?: string | null }
export type HealthResponse = Record<string, string> & { status?: string; version?: string }
export type ReadyResponseCompat = ReadyResponse
export type ReadyCheckCompat = ReadyCheck

// ── Legacy compat (deprecated, keep for Phase A migration) ───────
export interface CommandExecuteRequest { node_id: string; params?: Record<string, unknown> }
export interface CommandResult { stdout: string; stderr: string; exit_code: number }
export interface BulkCommandRequest { command: string; node_ids?: string[] | null; tags?: string[] | null; params?: Record<string, unknown> | null }
export interface BulkNodeResult { node_id: string; node_name: string; stdout: string; stderr: string; exit_code: number }
export interface BulkCommandResult { command: string; results: BulkNodeResult[]; total: number; succeeded: number; failed: number }
export interface ExecutionRetryResponse { execution_id: string; status: string; message: string }
export interface BulkCommandHistoryItem extends CommandHistoryResponse { batch_id?: string | null }
export interface BulkNodeOperationResult { affected: number; node_ids: string[]; errors?: string[] | null; failed?: number | null; succeeded?: number | null; total?: number | null }
export interface BulkNodeUpdateRequest { node_ids: string[]; changes: NodeUpdate }
export interface BulkNodeUpdateResponse { results: BulkNodeUpdateResult[]; total: number; succeeded: number; failed: number }
export interface BulkNodeMetricsRequest { node_ids: string[] }
export interface BulkNodeMetricsResponse { results: BulkNodeMetricsResult[]; total: number; succeeded: number; failed: number }
export interface BulkValidateCredentialsRequest { node_ids: string[]; tags?: string[] }
export interface BulkValidateCredentialsResponse { results: BulkValidateCredentialsResult[]; total: number; succeeded: number; failed: number }
export interface BulkCancelCommandRequest { execution_ids: string[] }
export interface BulkCancelCommandResponse { results: BulkCancelCommandResult[]; total: number; succeeded: number; failed: number }
export interface BulkRetryCommandRequest { execution_ids: string[] }
export interface BulkRetryCommandResponse { results: BulkRetryCommandResult[]; total: number; succeeded: number; failed: number }
export interface ScriptExecuteRequest { node_ids?: string[] | null; node_tags?: string[] | null; params?: Record<string, unknown> }
export interface ScriptExecutionBatchResult { script_id: string; results: { execution_id: string; node_id: string; node_name: string; status: 'success' | 'error'; steps: ScriptStepResult[] }[] }
export interface ScriptNodeResult { execution_id: string; node_id: string; node_name: string; status: 'success' | 'error'; steps: ScriptStepResult[] }
export interface ScriptCancelResponse { execution_id: string; status: string; message: string }
export interface ScriptRetryResponse { execution_id: string; status: string; message: string }
export interface ScriptBulkCancelRequest { execution_ids: string[] }
export interface ScriptBulkRetryRequest { execution_ids: string[] }
export interface ScriptBulkOperationResponse { results: { execution_id: string; status: string; message: string }[]; total: number; succeeded: number; failed: number }
export interface ScriptBulkResult { execution_id: string; status: string; message: string }
export interface NodeValidateRequest { host: string; port?: number; connection_type?: ConnectionType; username?: string | null; password?: string | null; ssh_key?: string | null; passphrase?: string | null }
export interface NodeValidateResponse { status: NodeStatus; message: string }
export interface NodeStatusHistoryResponse { items: NodeStatusHistoryItem[]; total: number; page: number; size: number }
export interface DockerContainerStatsResponse { Container: string; Name: string; CPUPerc: string; MemUsage: string; MemPerc: string; NetIO: string; BlockIO: string; MemLimit?: string | null; PIDs?: string | null }
export interface BulkDockerRequest { container_id: string; command?: string | null; node_ids: string[]; node_tags?: string[]; timeout?: number | null }
export interface BulkDockerResponse { action: string; results: { node_id: string; node_name: string; status: string; output?: string; error?: string }[]; total: number; succeeded: number; failed: number }
export interface BulkDockerNodeResult { node_id: string; node_name: string; status: string; output?: string; error?: string }
export interface BulkDockerImageBuildRequest { dockerfile: string; tag: string; node_ids?: string[]; node_tags?: string[]; build_args?: Record<string, string>; no_cache?: boolean; timeout?: number | null }
export interface BulkDockerImageBuildResult { node_id: string; node_name: string; status: string; output?: string; error?: string }
export interface BulkDockerImageBuildResponse { results: BulkDockerImageBuildResult[]; total: number; succeeded: number; failed: number }
export interface BulkDockerImageRemoveRequest { image_id: string; node_ids?: string[]; node_tags?: string[] }
export interface BulkDockerImageRemoveResult { node_id: string; node_name: string; status: string; output?: string; error?: string }
export interface BulkDockerImageRemoveResponse { results: BulkDockerImageRemoveResult[]; total: number; succeeded: number; failed: number }
export interface BulkDockerPullRequest { image: string; node_ids?: string[]; node_tags?: string[]; timeout?: number | null }
export interface BulkDockerPullResult { node_id: string; node_name: string; status: string; output?: string; error?: string }
export interface BulkDockerPullResponse { results: BulkDockerPullResult[]; total: number; succeeded: number; failed: number }
export interface BulkNodeCheckRequest { node_ids: string[] }
export interface BulkNodeDeleteRequest { node_ids: string[] }
export interface UserListResponseLegacy { items: UserResponse[]; total: number }
export type UserListResponseAlt = UserListResponse
