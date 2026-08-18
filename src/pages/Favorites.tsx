import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { TableSkeleton } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Pagination } from '../components/ui/Pagination'
import { PageHeader } from '../components/ui/PageHeader'
import { IconStar } from '../components/ui/Icons'
import { useFavorites, useRemoveFavorite } from '../hooks/useFavorites'
import { useNodes } from '../hooks/useNodes'
import { useCommands } from '../hooks/useCommands'
import { useScripts } from '../hooks/useScripts'
import { useToast } from '../components/ui/useToast'
import type { Favorite } from '../api/types'

function targetTypeVariant(targetType: string): 'info' | 'warning' | 'success' | 'default' {
  if (targetType === 'node') return 'info'
  if (targetType === 'command') return 'warning'
  if (targetType === 'script') return 'success'
  return 'default'
}

export function Favorites() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [targetType, setTargetType] = useState('')
  const pageSize = 20

  const { data, isLoading } = useFavorites({ page, size: pageSize, target_type: targetType || undefined })
  const removeFavorite = useRemoveFavorite()

  const { data: nodesData } = useNodes({ size: 200 })
  const { data: commandsData } = useCommands({ size: 200 })
  const { data: scriptsData } = useScripts({ size: 200 })

  const resourceNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const n of nodesData?.items ?? []) map.set(`node:${n.id}`, n.name)
    for (const c of commandsData?.items ?? []) map.set(`command:${c.id}`, c.name)
    for (const s of scriptsData?.items ?? []) map.set(`script:${s.id}`, s.name)
    return map
  }, [nodesData, commandsData, scriptsData])

  const favorites = data?.items ?? []

  const handleNavigate = (fav: Favorite) => {
    if (fav.target_type === 'node') navigate(`/nodes/${fav.target_id}`)
    else if (fav.target_type === 'command') navigate(`/commands/${fav.target_id}`)
    else navigate(`/scripts/${fav.target_id}`)
  }

  const handleRemove = (fav: Favorite) => {
    removeFavorite.mutate(
      { targetType: fav.target_type, targetId: fav.target_id },
      {
        onSuccess: () => toast('success', t('favorites.toastRemoved')),
        onError: () => toast('error', t('favorites.toastRemoveFailed')),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('favorites.title')} description={t('favorites.description')} />

      <Card className="stagger-item">
        <CardContent>
          <div className="flex items-center gap-3">
            <select value={targetType} onChange={(e) => { setTargetType(e.target.value); setPage(1) }} className="px-4 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
              <option value="">{t('favorites.allTypes', 'All types')}</option>
              <option value="node">{t('favorites.node')}</option>
              <option value="command">{t('favorites.command')}</option>
              <option value="script">{t('favorites.script')}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="stagger-item">
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : favorites.length === 0 ? (
            <EmptyState
              icon={<IconStar className="w-10 h-10" />}
              title={t('favorites.emptyTitle')}
              description={t('favorites.emptyDesc')}
            />
          ) : (
            <div className="divide-y divide-surface-200 dark:divide-surface-800">
              {favorites.map((fav) => {
                const name = resourceNames.get(`${fav.target_type}:${fav.target_id}`) || fav.target_id
                return (
                  <div key={fav.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={targetTypeVariant(fav.target_type)}>{fav.target_type}</Badge>
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{name}</p>
                        {fav.note && <p className="text-xs text-surface-500 mt-0.5">{fav.note}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-surface-400">{new Date(fav.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleNavigate(fav)}>{t('favorites.open')}</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(fav)} disabled={removeFavorite.isPending} className="text-red-500 hover:text-red-600">{t('common.delete')}</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.total > pageSize && (
        <div className="flex justify-center">
          <Pagination page={page} totalPages={Math.ceil(data.total / pageSize)} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
