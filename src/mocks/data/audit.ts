import type { AuditLog } from '../../api/types'

export const mockAuditLogs: AuditLog[] = [
  { id: '1', action: 'node.create', resource_type: 'node', resource_id: 'n1', user: 'admin', details: 'Created node "prod-server-01"', created_at: '2025-08-18T10:30:00Z' },
  { id: '2', action: 'command.execute', resource_type: 'command', resource_id: 'c1', user: 'admin', details: 'Executed "Check disk space" on node prod-server-01', created_at: '2025-08-18T10:25:00Z' },
  { id: '3', action: 'node.update', resource_type: 'node', resource_id: 'n2', user: 'admin', details: 'Updated tags for node staging-02', created_at: '2025-08-18T09:15:00Z' },
  { id: '4', action: 'api_key.create', resource_type: 'api_key', resource_id: 'k1', user: 'admin', details: 'Created API key "monitoring"', created_at: '2025-08-17T16:00:00Z' },
  { id: '5', action: 'script.execute', resource_type: 'script', resource_id: 's1', user: 'admin', details: 'Executed "Deploy update" script', created_at: '2025-08-17T14:30:00Z' },
  { id: '6', action: 'node.delete', resource_type: 'node', resource_id: 'n3', user: 'admin', details: 'Deleted node "test-old"', created_at: '2025-08-17T11:00:00Z' },
  { id: '7', action: 'node.check', resource_type: 'node', resource_id: 'n1', user: null, details: 'Health check passed', created_at: '2025-08-17T08:00:00Z' },
  { id: '8', action: 'command.create', resource_type: 'command', resource_id: 'c2', user: 'admin', details: 'Created command "Restart service"', created_at: '2025-08-16T15:00:00Z' },
  { id: '9', action: 'script.create', resource_type: 'script', resource_id: 's2', user: 'admin', details: 'Created script "Backup database"', created_at: '2025-08-16T10:00:00Z' },
  { id: '10', action: 'node.create', resource_type: 'node', resource_id: 'n4', user: 'admin', details: 'Created node "dev-docker"', created_at: '2025-08-15T14:00:00Z' },
]
