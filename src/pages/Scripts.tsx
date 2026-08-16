import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const scripts = [
  { id: '1', name: 'backup-db.sh', description: 'Backup PostgreSQL database', lastRun: '1 hour ago', status: 'success', schedule: 'Daily 02:00' },
  { id: '2', name: 'health-check.sh', description: 'Check system health metrics', lastRun: '5 min ago', status: 'success', schedule: 'Every 5 min' },
  { id: '3', name: 'deploy.sh', description: 'Deploy application to production', lastRun: '2 days ago', status: 'manual', schedule: 'Manual' },
  { id: '4', name: 'cleanup-logs.sh', description: 'Clean old log files', lastRun: '3 days ago', status: 'success', schedule: 'Weekly Sun 03:00' },
]

export function Scripts() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('scripts.title')}</h1>
          <p className="text-gray-400">{t('scripts.description')}</p>
        </div>
        <Button>{t('scripts.createScript')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scripts.map((script) => (
          <Card key={script.id}>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">{script.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{script.description}</p>
                </div>
                <Badge variant={script.status === 'success' ? 'success' : script.status === 'manual' ? 'info' : 'default'}>
                  {script.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                <div className="text-xs text-gray-500">
                  <span>{t('scripts.schedule')}: {script.schedule}</span>
                  <span className="mx-2">·</span>
                  <span>{t('scripts.lastRun')}: {script.lastRun}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">{t('scripts.edit')}</Button>
                  <Button variant="secondary" size="sm">{t('scripts.run')}</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
