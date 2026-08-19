import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Spinner } from '../ui/Spinner'
import { useExecContainer } from '../../hooks/useDocker'

export function ExecContainerContent({ nodeId, containerId, onClose }: { nodeId: string; containerId: string; onClose: () => void }) {
  const { t } = useTranslation()
  const execContainer = useExecContainer()
  const [command, setCommand] = useState('sh')
  const [output, setOutput] = useState('')

  const handleExec = () => {
    execContainer.mutate({ nodeId, containerId, data: { command } }, {
      onSuccess: (res) => { setOutput((prev) => prev + `\n$ ${command}\nstdout: ${res.stdout}\nstderr: ${res.stderr}\nexit_code: ${res.exit_code}\n`) },
      onError: (err) => { setOutput((prev) => prev + `\n$ ${command}\nError: ${err.message}\n`) },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input label={t('docker.command')} placeholder="sh -c 'ls -la'" value={command} onChange={(e) => setCommand(e.target.value)} className="flex-1" />
        <div className="flex items-end">
          <Button onClick={handleExec} disabled={execContainer.isPending || !command}>{execContainer.isPending ? <Spinner size="sm" /> : t('common.start')}</Button>
        </div>
      </div>
      {output && <pre className="text-xs font-mono text-surface-700 dark:text-surface-300 bg-surface-50 dark:bg-surface-800/50 rounded p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">{output}</pre>}
      <div className="flex justify-end"><Button variant="ghost" onClick={onClose}>{t('common.close')}</Button></div>
    </div>
  )
}
