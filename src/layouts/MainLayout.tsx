import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/auth-store'
import { useUiStore } from '../stores/ui-store'
import { useConnectionStore } from '../stores/connection-store'
import { ThemeToggle } from '../components/layout/ThemeToggle'
import { CommandPalette } from '../components/ui/CommandPalette'

const navItems = [
  { to: '/', key: 'nav.dashboard', icon: '📊' },
  { to: '/nodes', key: 'nav.nodes', icon: '🖥️' },
  { to: '/commands', key: 'nav.commands', icon: '⚡' },
  { to: '/scripts', key: 'nav.scripts', icon: '📜' },
  { to: '/settings', key: 'nav.settings', icon: '⚙️' },
]

export function MainLayout() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const wsConnected = useConnectionStore((s) => s.wsConnected)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ru' : 'en')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-30 bg-black/50 dark:bg-black/60 transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-surface-200 dark:bg-surface-900 dark:border-surface-800 flex flex-col
          transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800">
          <h1 className="text-xl font-bold text-surface-900 dark:text-white">NodeNexus</h1>
          <p className="text-sm text-surface-500 dark:text-surface-500">Panel</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-100 text-surface-900 dark:bg-surface-800 dark:text-white'
                    : 'text-surface-500 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-surface-200 dark:border-surface-800 space-y-1">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white transition-colors"
          >
            <span className="text-lg">🌐</span>
            {i18n.language === 'en' ? 'Русский' : 'English'}
          </button>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-50 hover:text-red-600 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-red-400 transition-colors"
          >
            <span className="text-lg">🚪</span>
            {t('common.logout', 'Logout')}
          </button>

          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-sm font-medium text-white">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-surface-200 dark:bg-surface-900 dark:border-surface-800 flex items-center px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mr-4 p-2 rounded-lg text-surface-400 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {wsConnected ? t('common.connected') : t('common.disconnected', 'Disconnected')}
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 rounded cursor-pointer" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
              Ctrl+K
            </kbd>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}
