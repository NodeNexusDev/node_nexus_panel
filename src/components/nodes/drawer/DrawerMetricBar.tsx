// oxlint-disable react/set-state-in-effect, react/exhaustive-effect-dependencies, react/no-array-index-key, react-hooks/exhaustive-deps
export function DrawerMetricBar({ label, value, percent }: { label: string; value: string; percent: number }) {
  const pct = Math.min(100, Math.max(0, percent))
  return (
    <div>
      <div className="flex justify-between mb-1"><span className="text-xs text-surface-600 dark:text-surface-400">{label}</span><span className="text-xs font-medium text-surface-900 dark:text-white">{value}</span></div>
      <div className="h-2 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden"><div className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-accent-500'}`} style={{ width: `${pct}%` }} /></div>
    </div>
  )
}