import { http, HttpResponse } from 'msw'
import { mockDashboard } from '../data/dashboard'

const API_URL = 'http://localhost:8000'

export const dashboardHandlers = [
  http.get(`${API_URL}/api/v1/dashboard/`, () => {
    return HttpResponse.json(mockDashboard)
  }),

  http.get(`${API_URL}/api/v1/dashboard/metrics`, () => {
    return HttpResponse.json({
      command_metrics: [
        { period: '2026-01-09', total: 12, successful: 10, failed: 2, avg_duration_ms: 1200 },
        { period: '2026-01-10', total: 15, successful: 14, failed: 1, avg_duration_ms: 980 },
        { period: '2026-01-11', total: 8, successful: 8, failed: 0, avg_duration_ms: 1100 },
        { period: '2026-01-12', total: 20, successful: 18, failed: 2, avg_duration_ms: 1500 },
        { period: '2026-01-13', total: 14, successful: 13, failed: 1, avg_duration_ms: 890 },
        { period: '2026-01-14', total: 18, successful: 17, failed: 1, avg_duration_ms: 1050 },
        { period: '2026-01-15', total: 10, successful: 10, failed: 0, avg_duration_ms: 950 },
      ],
      script_metrics: [
        { period: '2026-01-09', total: 3, successful: 3, failed: 0, avg_duration_ms: 5000 },
        { period: '2026-01-10', total: 2, successful: 2, failed: 0, avg_duration_ms: 4500 },
        { period: '2026-01-11', total: 4, successful: 3, failed: 1, avg_duration_ms: 6000 },
        { period: '2026-01-12', total: 1, successful: 1, failed: 0, avg_duration_ms: 3000 },
        { period: '2026-01-13', total: 3, successful: 3, failed: 0, avg_duration_ms: 5200 },
        { period: '2026-01-14', total: 2, successful: 2, failed: 0, avg_duration_ms: 4800 },
        { period: '2026-01-15', total: 2, successful: 2, failed: 0, avg_duration_ms: 4200 },
      ],
    })
  }),
]
