import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useHotkey } from '../../hooks/useHotkey'
import { IconDashboard, IconNodes, IconCommands, IconScripts, IconSettings } from './Icons'

interface CommandItem {
  id: string
  label: string
  description: string
  path: string
  icon: ReactNode
}

export function CommandPalette() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = useMemo(() => [
    { id: 'dashboard', label: t('nav.dashboard'), description: 'View system overview', path: '/', icon: <IconDashboard className="w-5 h-5" /> },
    { id: 'nodes', label: t('nav.nodes'), description: 'Manage server nodes', path: '/nodes', icon: <IconNodes className="w-5 h-5" /> },
    { id: 'commands', label: t('nav.commands'), description: 'Execute commands', path: '/commands', icon: <IconCommands className="w-5 h-5" /> },
    { id: 'scripts', label: t('nav.scripts'), description: 'Manage scripts', path: '/scripts', icon: <IconScripts className="w-5 h-5" /> },
    { id: 'settings', label: t('nav.settings'), description: 'System settings', path: '/settings', icon: <IconSettings className="w-5 h-5" /> },
  ], [t])

  const filtered = useMemo(() => {
    if (!query) return commands
    const lower = query.toLowerCase()
    return commands.filter(
      (c) => c.label.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower),
    )
  }, [commands, query])

  useHotkey('k', () => setIsOpen(true), { ctrl: true })

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (!listRef.current) return
    const item = listRef.current.children[selectedIndex] as HTMLElement
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const select = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
        break
      case 'Enter':
        e.preventDefault()
        if (filtered[selectedIndex]) select(filtered[selectedIndex].path)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
      onClick={() => setIsOpen(false)}
    >
      <div className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white border border-surface-200 dark:bg-surface-900 dark:border-surface-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-surface-200 dark:border-surface-800">
          <svg className="w-5 h-5 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('commandPalette.placeholder')}
            className="flex-1 py-3 bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-surface-400 bg-surface-100 dark:bg-surface-800 rounded">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-64 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-surface-500 dark:text-surface-400">
              {t('commandPalette.noResults')}
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => select(cmd.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  i === selectedIndex
                    ? 'bg-surface-100 dark:bg-surface-800'
                    : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                }`}
              >
                <span className="text-surface-500 dark:text-surface-400">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{cmd.label}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{cmd.description}</p>
                </div>
                <svg className="w-4 h-4 text-surface-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
