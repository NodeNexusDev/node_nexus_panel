import type { DashboardResponse } from '../../api/types'

export const mockDashboard: DashboardResponse = {
  nodes: {
    total: 5,
    active: 4,
    unreachable: 1,
  },
  docker: {
    total: 12,
    running: 8,
    stopped: 4,
  },
  scripts: {
    total: 3,
  },
  commands: {
    total: 48,
  },
  recent_activity: [
    {
      id: '1',
      action: 'command_executed',
      node_id: '1',
      user: 'admin',
      details: 'df -h executed on prod-server-01',
      created_at: '2026-01-15T10:30:00Z',
    },
    {
      id: '2',
      action: 'node_online',
      node_id: '2',
      user: null,
      details: 'staging-server-01 came online',
      created_at: '2026-01-15T10:15:00Z',
    },
    {
      id: '3',
      action: 'script_executed',
      node_id: '1',
      user: 'admin',
      details: 'backup-db.sh completed successfully',
      created_at: '2026-01-15T09:00:00Z',
    },
    {
      id: '4',
      action: 'node_offline',
      node_id: '3',
      user: null,
      details: 'dev-server-01 went offline',
      created_at: '2026-01-15T08:30:00Z',
    },
    {
      id: '5',
      action: 'command_executed',
      node_id: '2',
      user: 'admin',
      details: 'docker ps executed on staging-server-01',
      created_at: '2026-01-15T08:00:00Z',
    },
  ],
}
