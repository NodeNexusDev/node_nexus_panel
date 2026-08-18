import type { Note } from '../../api/types'

export const mockNotes: Note[] = [
  {
    id: '1',
    target_type: 'node',
    target_id: '1',
    content: 'Production server. Runs nginx and PostgreSQL. Deploy via git push.',
    created_at: '2025-08-15T10:00:00Z',
    updated_at: '2025-08-15T10:00:00Z',
  },
  {
    id: '2',
    target_type: 'command',
    target_id: '1',
    content: 'Use this to check disk space before deployments. Alert if > 80%.',
    created_at: '2025-08-16T14:00:00Z',
    updated_at: '2025-08-16T14:00:00Z',
  },
]
