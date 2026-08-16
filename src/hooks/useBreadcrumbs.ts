import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface BreadcrumbItem {
  label: string
  href?: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'nav.dashboard',
  nodes: 'nav.nodes',
  commands: 'nav.commands',
  scripts: 'nav.scripts',
  settings: 'nav.settings',
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const { t } = useTranslation()
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const items: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), href: '/' },
  ]

  let path = ''
  for (const segment of segments) {
    path += `/${segment}`
    const key = routeLabels[segment]
    items.push({
      label: key ? t(key) : segment,
      href: path,
    })
  }

  return items
}
