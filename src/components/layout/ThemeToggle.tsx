import { useUiStore } from '../../stores/ui-store'

export function ThemeToggle() {
  const { theme, setTheme } = useUiStore()

  const themes = ['dark', 'light', 'system'] as const

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  const icons: Record<string, string> = {
    dark: '🌙',
    light: '☀️',
    system: '💻',
  }

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
      title={`Theme: ${theme}`}
    >
      <span className="text-lg">{icons[theme]}</span>
      {theme.charAt(0).toUpperCase() + theme.slice(1)}
    </button>
  )
}
