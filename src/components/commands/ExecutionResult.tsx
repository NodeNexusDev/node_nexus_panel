import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tabs } from '../ui/Tabs'
import { Badge } from '../ui/Badge'

interface ExecutionResultProps {
  stdout: string
  stderr: string
  exitCode: number
  showExitCode?: boolean
}

type ResultTab = 'stdout' | 'stderr'

export function ExecutionResult({ stdout, stderr, exitCode, showExitCode = true }: ExecutionResultProps) {
  const { t } = useTranslation()
  const safeStdout = stdout ?? ''
  const safeStderr = stderr ?? ''
  const [tab, setTab] = useState<ResultTab>(safeStderr ? 'stderr' : 'stdout')

  const tabs: { key: ResultTab; label: string }[] = [
    { key: 'stdout', label: t('common.stdout', 'stdout') },
    { key: 'stderr', label: `${t('common.stderr', 'stderr')}${safeStderr ? ` (${safeStderr.split('\n').length})` : ''}` },
  ]

  return (
    <div className="space-y-3">
      {showExitCode && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-surface-600 dark:text-surface-400">{t('commands.exitCode')}:</span>
          <Badge variant={exitCode === 0 ? 'success' : 'danger'}>{exitCode}</Badge>
        </div>
      )}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="max-h-64 overflow-y-auto rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
        {tab === 'stdout' ? (
          safeStdout ? (
            <pre className="p-4 text-xs font-mono text-surface-700 dark:text-surface-300 whitespace-pre-wrap">{safeStdout}</pre>
          ) : (
            <p className="p-4 text-sm text-surface-400 text-center">{t('commands.noOutput')}</p>
          )
        ) : safeStderr ? (
          <pre className="p-4 text-xs font-mono text-red-600 dark:text-red-400 whitespace-pre-wrap">{safeStderr}</pre>
        ) : (
          <p className="p-4 text-sm text-surface-400 text-center">{t('commands.noOutput')}</p>
        )}
      </div>
    </div>
  )
}
