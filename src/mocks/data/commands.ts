import type { Command } from '../../api/types'

export const mockCommands: Command[] = [
  {
    id: '1',
    name: 'Check Disk Space',
    description: 'Check disk usage on all mounted filesystems',
    command: 'df -h',
    parameters: null,
    tags: ['system', 'monitoring'],
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id: '2',
    name: 'List Docker Containers',
    description: 'Show all running Docker containers',
    command: 'docker ps --format "{{.Names}}\\t{{.Status}}"',
    parameters: null,
    tags: ['docker'],
    created_at: '2026-01-11T10:00:00Z',
    updated_at: '2026-01-11T10:00:00Z',
  },
  {
    id: '3',
    name: 'Check Service Status',
    description: 'Check status of a systemd service',
    command: 'systemctl status {service_name}',
    parameters: [
      {
        name: 'service_name',
        type: 'string',
        required: true,
        default: null,
        description: 'Name of the systemd service',
      },
    ],
    tags: ['system', 'services'],
    created_at: '2026-01-12T14:00:00Z',
    updated_at: '2026-01-12T14:00:00Z',
  },
  {
    id: '4',
    name: 'System Uptime',
    description: 'Show system uptime and load averages',
    command: 'uptime',
    parameters: null,
    tags: ['system', 'monitoring'],
    created_at: '2026-01-13T09:00:00Z',
    updated_at: '2026-01-13T09:00:00Z',
  },
]
