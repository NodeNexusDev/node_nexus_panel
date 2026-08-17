import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '../../stores/ui-store'
import { IconMoon, IconSun, IconLaptop } from '../ui/Icons'

export function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, setTheme } = useUiStore()

  const themes = ['dark', 'light', 'system'] as const

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    setTheme(themes[(currentIndex + 1) % themes.length])
  }

  const icons: Record<string, ReactNode> = {
    dark: <IconMoon className="w-5 h-5" />,
    light: <IconSun className="w-5 h-5" />,
    system: <IconLaptop className="w-5 h-5" />,
  }

  const themeLabels: Record<string, string> = {
    dark: t('settings.themeDark'),
    light: t('settings.themeLight'),
    system: t('settings.themeSystem'),
  }

  return (
    <button
      onClick={cycleTheme}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-50 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-white transition-colors cursor-pointer"
      title={t('settings.themeTitle', { theme: themeLabels[theme] })}
    >
      <span className="text-surface-500 dark:text-surface-400">{icons[theme]}</span>
      {themeLabels[theme]}
    </button>
  )
}
