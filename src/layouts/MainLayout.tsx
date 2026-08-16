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
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 dark:from-indigo-500/10 dark:via-transparent dark:to-purple-500/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
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
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">NodeNexus</h1>
              <p className="text-xs text-surface-500 dark:text-surface-500">Panel v0.4.0</p>
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 stagger-item ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400 shadow-sm'
                    : 'text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white'
                }`
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="text-lg">{item.icon}</span>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-surface-200/50 dark:border-surface-800/50 space-y-1">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white transition-all duration-200"
          >
            <span className="text-lg">🌐</span>
            {i18n.language === 'en' ? 'Русский' : 'English'}
          </button>

          <ThemeToggle />

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:bg-red-50 hover:text-red-600 dark:text-surface-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-all duration-200"
          >
            <span className="text-lg">🚪</span>
            {t('common.logout', 'Logout')}
          </button>

          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-xl bg-surface-50/50 dark:bg-surface-800/30">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/25">
              {user?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-surface-500 dark:text-surface-500 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header with glassmorphism */}
        <header className="h-16 glass border-b border-surface-200/50 dark:border-surface-800/50 flex items-center px-6 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden mr-4 p-2 rounded-xl text-surface-400 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100/50 dark:bg-surface-800/50">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 status-online' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-surface-500 dark:text-surface-400">
                {wsConnected ? t('common.connected') : t('common.disconnected', 'Disconnected')}
              </span>
            </div>
            {/* Command palette trigger */}
            <button
              onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:text-surface-500 dark:hover:text-surface-300 dark:hover:bg-surface-800 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="hidden sm:inline-flex text-xs">Ctrl+K</kbd>
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
