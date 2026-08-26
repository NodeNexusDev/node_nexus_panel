import type { UserResponse } from '../../api/types'

export const mockUsers: UserResponse[] = [
  {
    id: '1',
    email: 'admin@nodenexus.dev',
    is_active: true,
    is_superuser: true,
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: '2',
    email: 'user@nodenexus.dev',
    is_active: true,
    is_superuser: false,
    created_at: '2026-01-12T10:00:00Z',
  },
  {
    id: '3',
    email: 'inactive@nodenexus.dev',
    is_active: false,
    is_superuser: false,
    created_at: '2026-01-14T14:00:00Z',
  },
]
