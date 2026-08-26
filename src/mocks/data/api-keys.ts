import type { APIKeyResponse } from '../../api/types'

export const mockApiKeys: APIKeyResponse[] = [
  {
    id: '1',
    name: 'Production Key',
    key_prefix: 'sk-pr',
    is_active: true,
    scope: 'read-write',
    created_at: '2026-01-10T08:00:00Z',
    last_used_at: '2026-01-15T10:30:00Z',
    expires_at: null,
  },
  {
    id: '2',
    name: 'CI/CD Key',
    key_prefix: 'sk-ci',
    is_active: true,
    scope: 'read-only',
    created_at: '2026-01-12T14:00:00Z',
    last_used_at: '2026-01-14T16:00:00Z',
    expires_at: '2026-06-30T00:00:00Z',
  },
  {
    id: '3',
    name: 'Development Key',
    key_prefix: 'sk-dv',
    is_active: false,
    scope: 'read-write',
    created_at: '2026-01-14T09:00:00Z',
    last_used_at: null,
    expires_at: null,
  },
]
