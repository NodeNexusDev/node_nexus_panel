import { useMemo } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIsFetching } from '@tanstack/react-query'
import { useAuthStore } from '../stores/auth-store'
import { useUiStore } from '../stores/ui-store'
import { useSse } from '../hooks/useSse'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useNode } from '../hooks/useNodes'
import { useCommand } from '../hooks/useCommands'
import { useScript } from '../hooks/useScripts'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { CommandPalette } from '../components/ui/CommandPalette'
import { Tooltip } from '../components/ui/Tooltip'
import { IconDashboard, IconNodes, IconCommands, IconScripts, IconDocker, IconAudit, IconSettings, IconGlobe, IconLogout, IconTag, IconStar, IconRefresh } from '../components/ui/Icons'
import { queryClient } from '../lib/query-client'
import { APP_VERSION } from '../lib/version'

const navItems = [
  { to: '/', key: 'nav.dashboard', Icon: IconDashboard },
  { to: '/nodes', key: 'nav.nodes', Icon: IconNodes },
  { to: '/commands', key: 'nav.commands', Icon: IconCommands },
  { to: '/scripts', key: 'nav.scripts', Icon: IconScripts },
  { to: '/docker', key: 'nav.docker', Icon: IconDocker },
  { to: '/tags', key: 'nav.tags', Icon: IconTag },
  { to: '/favorites', key: 'nav.favorites', Icon: IconStar },
  { to: '/audit', key: 'nav.audit', Icon: IconAudit },
  { to: '/settings', key: 'nav.settings', Icon: IconSettings },
]

export function MainLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)
  const wsConnected = useSse().isConnected
  const isFetching = useIsFetching() > 0

  const location = useLocation()
  const nodeId = location.pathname.match(/^\/nodes\/([^/]+)$/)?.[1]
  const commandId = location.pathname.match(/^\/commands\/([^/]+)$/)?.[1]
  const scriptId = location.pathname.match(/^\/scripts\/([^/]+)$/)?.[1]
  const { data: node } = useNode(nodeId ?? '')
  const { data: command } = useCommand(commandId ?? '')
  const { data: script } = useScript(scriptId ?? '')

  const staticTitles: Record<string, string> = {
    '/': 'dashboard.title',
    '/nodes': 'nodes.title',
    '/commands': 'commands.title',
    '/scripts': 'scripts.title',
    '/docker': 'docker.title',
    '/audit': 'audit.title',
    '/settings': 'settings.title',
    '/tags': 'tags.title',
    '/favorites': 'favorites.title',
  }

  const titleKey = staticTitles[location.pathname]
  const documentTitle = titleKey
    ? t(titleKey)
    : nodeId ? node?.name : commandId ? command?.name : scriptId ? script?.name : undefined

  useDocumentTitle(documentTitle)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')
  }

  const particles = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 5,
      delay: `${Math.random() * 8}s`,
      duration: `${6 + Math.random() * 6}s`,
      opacity: 0.15 + Math.random() * 0.35,
    }))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Background layer — z-10 is below content but above body */}
      <div className="fixed inset-0 -z-10 bg-surface-50 dark:bg-surface-950">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-purple-500/5 dark:from-accent-500/10 dark:via-transparent dark:to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        {/* Animated grid dots */}
        <div className="absolute inset-0 opacity-[0.07] dark:opacity-[0.1] text-surface-900 dark:text-white" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        {/* Floating particles */}
        <div className="particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
                '--p-opacity': p.opacity,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 dark:bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl
          border-r border-surface-200/50 dark:border-surface-800/50
          transition-all duration-300 ease-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-surface-200/50 dark:border-surface-800/50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="NodeNexus" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold gradient-text">NodeNexus</h1>
              <p className="text-xs text-surface-500 dark:text-surface-500">Panel v{APP_VERSION}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium transition-all duration-200 stagger-item ${
                  isActive
                    ? 'bg-gradient-to-r from-accent-500/10 to-purple-500/10 text-accent-600 dark:from-accent-500/20 dark:to-purple-500/20 dark:text-accent-400 shadow-sm'
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-lg"><item.Icon className="w-5 h-5" /></span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header with glassmorphism */}
        <header className="h-[84px] glass border-b border-surface-200/50 dark:border-surface-800/50 flex items-center px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mr-4 p-2 rounded-xl text-surface-400 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white transition-all duration-200 cursor-pointer"
            >
              <IconGlobe className="w-4 h-4" />
              {i18n.language === 'en' ? 'РУ' : 'EN'}
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Refresh */}
            <Tooltip content={t('common.refresh')}>
              <button
                onClick={() => queryClient.invalidateQueries()}
                disabled={isFetching}
                aria-label={t('common.refresh')}
                className={`p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-all duration-200 ${isFetching ? '' : 'cursor-pointer'}`}
              >
                <IconRefresh className={`w-4 h-4 ${isFetching ? 'animate-spin text-accent-500' : ''}`} />
              </button>
            </Tooltip>

            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100/50 dark:bg-surface-800/50">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                {wsConnected ? t('dashboard.liveUpdates') : t('dashboard.offline')}
              </span>
            </div>

            {/* Command palette trigger */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-500 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="hidden sm:inline-flex text-xs">Ctrl+K</kbd>
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-surface-400 hover:text-red-500 hover:bg-red-50 dark:text-surface-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
              title={t('common.logout')}
            >
              <IconLogout className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
