import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface MetricsBucket {
  period: string
  total: number
  successful: number
  failed: number
  avg_duration_ms?: number | null
}

interface MetricsChartProps {
  data: MetricsBucket[]
  height?: number
  className?: string
}

interface TooltipData {
  bucket: MetricsBucket
  x: number
  y: number
}

export function MetricsChart({ data, height = 120, className = '' }: MetricsChartProps) {
  const { t } = useTranslation()
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  if (data.length === 0) {
    return <div className={`flex items-center justify-center text-sm text-surface-400 dark:text-surface-500`} style={{ height }}>{t('dashboard.noData', 'No data')}</div>
  }

  const max = Math.max(...data.map((d) => d.total), 1)
  const chartWidth = Math.max(data.length * 24, 100)
  const barWidth = chartWidth / data.length
  const padding = Math.max(barWidth * 0.25, 0.5)
  const chartHeight = height - 20

  const formatDate = (period: string) => {
    const d = new Date(period)
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  }

  const handleMouseMove = (_: React.MouseEvent<SVGGElement>, bucket: MetricsBucket, index: number) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((index + 0.5) / data.length) * rect.width
    const y = rect.top + 20
    setTooltip({ bucket, x, y })
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="grad-success" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="text-green-400 dark:text-green-500" stopColor="currentColor" />
            <stop offset="100%" className="text-green-600 dark:text-green-400" stopColor="currentColor" />
          </linearGradient>
          <linearGradient id="grad-failed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className="text-red-400 dark:text-red-500" stopColor="currentColor" />
            <stop offset="100%" className="text-red-600 dark:text-red-400" stopColor="currentColor" />
          </linearGradient>
        </defs>

        {data.map((bucket, i) => {
          const x = (i / data.length) * chartWidth + padding / 2
          const w = (barWidth - padding)
          const successH = (bucket.successful / max) * chartHeight
          const failedH = (bucket.failed / max) * chartHeight
          const totalH = successH + failedH
          const y = chartHeight - totalH

          return (
            <g
              key={bucket.period}
              onMouseMove={(e) => handleMouseMove(e, bucket, i)}
              className="cursor-pointer"
            >
              {bucket.failed > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={failedH}
                  rx={w > 3 ? 1.5 : 0}
                  fill="url(#grad-failed)"
                  className="transition-opacity"
                  style={{
                    animation: `chart-bar-in 0.4s ease-out ${i * 60}ms both`,
                    transformOrigin: `${x + w / 2}px ${chartHeight}px`,
                  }}
                />
              )}
              <rect
                x={x}
                y={chartHeight - successH}
                width={w}
                height={successH}
                rx={w > 3 ? 1.5 : 0}
                fill="url(#grad-success)"
                className="transition-opacity"
                style={{
                  animation: `chart-bar-in 0.4s ease-out ${i * 60}ms both`,
                  transformOrigin: `${x + w / 2}px ${chartHeight}px`,
                }}
              />
            </g>
          )
        })}

        {/* X-axis date labels */}
        {data.map((bucket, i) => {
          const x = ((i + 0.5) / data.length) * chartWidth
          const show = data.length <= 7 || i % Math.ceil(data.length / 7) === 0
          if (!show) return null
          return (
            <text
              key={`label-${bucket.period}`}
              x={x}
              y={height - 4}
              textAnchor="middle"
              className="fill-surface-400 dark:fill-surface-500"
              style={{ fontSize: data.length > 14 ? '2.5px' : '3.5px' }}
            >
              {formatDate(bucket.period)}
            </text>
          )
        })}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg p-3 text-xs min-w-[160px]"
          style={{ left: tooltip.x, top: tooltip.y - 10, transform: 'translate(-50%, -100%)' }}
        >
          <p className="font-medium text-surface-900 dark:text-white mb-1.5">{formatDate(tooltip.bucket.period)}</p>
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-surface-500">{t('dashboard.total', 'Total')}</span>
              <span className="font-medium text-surface-900 dark:text-white">{tooltip.bucket.total}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-green-600 dark:text-green-400">{t('dashboard.successful', 'Successful')}</span>
              <span className="font-medium text-green-600 dark:text-green-400">{tooltip.bucket.successful}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-red-600 dark:text-red-400">{t('dashboard.failed', 'Failed')}</span>
              <span className="font-medium text-red-600 dark:text-red-400">{tooltip.bucket.failed}</span>
            </div>
            {tooltip.bucket.avg_duration_ms != null && (
              <div className="flex justify-between gap-4 pt-1 border-t border-surface-200 dark:border-surface-700">
                <span className="text-surface-500">{t('dashboard.avgDuration', 'Avg duration')}</span>
                <span className="font-medium text-surface-900 dark:text-white">{tooltip.bucket.avg_duration_ms}ms</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <span className="text-xs text-surface-500">Successful</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
          <span className="text-xs text-surface-500">Failed</span>
        </div>
      </div>
    </div>
  )
}
