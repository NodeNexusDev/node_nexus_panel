import { http, HttpResponse } from 'msw'
import { mockDashboard } from '../data/dashboard'

const API_URL = '*'

export const dashboardHandlers = [
  http.get(`${API_URL}/api/v1/dashboard/`, () => {
    return HttpResponse.json(mockDashboard)
  }),

  http.get(`${API_URL}/api/v1/dashboard/metrics`, ({ request }) => {
    const url = new URL(request.url)
    const groupBy = url.searchParams.get('group_by') || 'day'

    const genDays = (count: number) => {
      const now = new Date('2026-01-15')
      return Array.from({ length: count }, (_, i) => {
        const d = new Date(now)
        d.setDate(d.getDate() - (count - 1 - i))
        return d.toISOString().slice(0, 10)
      })
    }

    const periods = groupBy === 'month'
      ? ['2025-10', '2025-11', '2025-12', '2026-01']
      : groupBy === 'week'
        ? ['2025-12-22', '2025-12-29', '2026-01-05', '2026-01-12']
        : genDays(14)

    const cmdBase = [8, 12, 6, 15, 10, 18, 14, 9, 20, 11, 16, 13, 7, 17]
    const scrBase = [2, 3, 1, 4, 2, 5, 3, 1, 4, 2, 3, 2, 1, 3]

    return HttpResponse.json({
      command_metrics: periods.map((period, i) => {
        const total = cmdBase[i % cmdBase.length] + Math.floor(Math.random() * 4)
        const successful = total - Math.floor(Math.random() * 2)
        return { period, total, successful, failed: total - successful, cancelled: 0, avg_duration_ms: 800 + Math.floor(Math.random() * 700) }
      }),
      script_metrics: periods.map((period, i) => {
        const total = scrBase[i % scrBase.length] + Math.floor(Math.random() * 2)
        const successful = total - (Math.random() > 0.8 ? 1 : 0)
        return { period, total, successful, failed: total - successful, cancelled: 0, avg_duration_ms: 3000 + Math.floor(Math.random() * 3000) }
      }),
    })
  }),
]
