interface MiniChartProps {
  data: number[]
  color?: string
  className?: string
}

export function MiniChart({ data, color = 'bg-accent-500', className = '' }: MiniChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className={`mini-chart ${className}`}>
      {data.map((value, i) => (
        <div
          key={i}
          className={`mini-chart-bar ${color} opacity-60 hover:opacity-100 transition-opacity`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}
