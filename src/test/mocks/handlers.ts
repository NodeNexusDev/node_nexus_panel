import { http, HttpResponse, type StrictRequest, type DefaultBodyType } from 'msw'
import { setupServer } from 'msw/node'

const API_URL = 'http://localhost:8000'

export const handlers = [
  http.get(`${API_URL}/api/nodes`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'prod-server-01',
          status: 'online',
          ip: '192.168.1.100',
          os: 'Ubuntu 22.04',
          cpu: '45%',
          memory: '62%',
          lastSeen: '2 min ago',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })
  }),

  http.get(`${API_URL}/api/nodes/stats`, () => {
    return HttpResponse.json({
      data: {
        totalNodes: 5,
        online: 4,
        offline: 1,
        commandsToday: 48,
      },
    })
  }),

  http.post(`${API_URL}/api/auth/login`, async ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            name: 'Admin',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
      })
    }
    return new HttpResponse(
      JSON.stringify({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }),
      { status: 401 },
    )
  }),

  http.post(`${API_URL}/api/commands/execute`, async ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
    const body = (await request.json()) as { command: string; nodeId: string }
    return HttpResponse.json({
      data: {
        id: '1',
        command: body.command,
        node: body.nodeId,
        nodeId: body.nodeId,
        status: 'success',
        output: 'Command executed successfully',
        timestamp: new Date().toISOString(),
      },
    })
  }),

  http.get(`${API_URL}/api/scripts`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'backup-db.sh',
          description: 'Backup PostgreSQL database',
          lastRun: '1 hour ago',
          status: 'success',
          schedule: 'Daily 02:00',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
    })
  }),

  http.get(`${API_URL}/api/auth/me`, ({ request }: { request: StrictRequest<DefaultBodyType> }) => {
    const auth = request.headers.get('Authorization')
    if (auth === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        data: {
          id: '1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
        },
      })
    }
    return new HttpResponse(
      JSON.stringify({ code: 'UNAUTHORIZED', message: 'Unauthorized' }),
      { status: 401 },
    )
  }),
]

export const server = setupServer(...handlers)
