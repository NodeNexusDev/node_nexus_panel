// oxlint-disable react-hooks/exhaustive-deps
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs } from '../ui/Tabs'
import { Card, CardContent } from '../ui/Card'
import { KeyValueList } from '../ui/KeyValueList'
import { useToast } from '../ui/useToast'
import { IconDocker } from '../ui/Icons'
import { useDeleteVolume } from '../../hooks/useDocker'
import { VolumeInspectContent } from './VolumeInspectContent'
import type { DockerVolume } from '../../api/types'

type DrawerTab = 'overview' | 'inspect'

interface VolumeDrawerProps {
  nodeId: string
  volume: DockerVolume
  onClose: () => void
}

export function VolumeDrawer({ nodeId, volume, onClose }: VolumeDrawerProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [active, setActive] = useState<DrawerTab>('overview')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteVolume = useDeleteVolume()

  useEffect(() => {
    setActive('overview')
    setShowDeleteConfirm(false)
  }, [volume.Name])

  const tabs: { key: DrawerTab; label: string }[] = [
    { key: 'overview', label: t('docker.overview', 'Overview') },
    { key: 'inspect', label: t('docker.inspect', 'Inspect') },
  ]

  const handleDelete = () => {
    deleteVolume.mutate({ nodeId, volumeName: volume.Name }, {
      onSuccess: () => { toast('success', t('docker.toastDeleteVolumeDone', 'Volume deleted')); onClose() },
      onError: () => toast('error', t('docker.toastDeleteVolumeFailed', 'Delete failed')),
    })
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 flex items-center justify-center shrink-0">
          <IconDocker className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-surface-900 dark:text-white truncate">{volume.Name}</p>
          <p className="text-xs font-mono text-surface-500 truncate">{volume.Driver}</p>
        </div>
        <button onClick={onClose} aria-label={t('common.close')} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-md)] text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 shrink-0 cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="default">{volume.Driver}</Badge>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm((v) => !v)} className="text-red-500 ml-auto">{t('common.delete')}</Button>
      </div>
      {showDeleteConfirm && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-center justify-between gap-3">
          <p className="text-xs text-red-700 dark:text-red-300">{t('docker.deleteVolumeMsg', { name: volume.Name })}</p>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" size="sm" disabled={deleteVolume.isPending} onClick={handleDelete}>{deleteVolume.isPending ? t('common.loading') : t('common.delete')}</Button>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} active={active} onChange={setActive} />

      {active === 'overview' && <VolumeOverview volume={volume} />}
      {active === 'inspect' && <VolumeInspectContent nodeId={nodeId} volumeName={volume.Name} />}
    </div>
  )
}

function VolumeOverview({ volume }: { volume: DockerVolume }) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <KeyValueList rows={[
          { label: t('docker.name', 'Name'), value: volume.Name },
          { label: t('docker.driver', 'Driver'), value: volume.Driver },
        ]} />
      </CardContent>
    </Card>
  )
}
