import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { ExecutionResult } from '../commands/ExecutionResult'
import type { ScriptNodeResult } from '../../api/types'

interface ScriptBulkNodeResultItemProps {
  result: ScriptNodeResult
}

export function ScriptBulkNodeResultItem({ result }: ScriptBulkNodeResultItemProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${result.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-surface-900 dark:text-white">{result.node_name}</span>
          <Badge variant={result.status === 'success' ? 'success' : 'danger'}>
            {result.steps.filter((s) => s.exit_code === 0).length}/{result.steps.length} {t('scripts.steps', 'steps')}
          </Badge>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-surface-200 dark:border-surface-700 p-3 space-y-3">
          {result.steps.map((step, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                  {t('scripts.step', 'Step')} {idx + 1}{step.label ? `: ${step.label}` : ''}
                </span>
                <Badge variant={step.exit_code === 0 ? 'success' : 'danger'}>
                  {t('common.exitCode', 'exit')} {step.exit_code}
                </Badge>
                {step.truncated && (
                  <Badge variant="warning">{t('scripts.truncated', 'Truncated')}</Badge>
                )}
              </div>
              <ExecutionResult stdout={step.stdout} stderr={step.stderr} exitCode={step.exit_code} showExitCode={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
