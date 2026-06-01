import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

interface ThemeToggleProps {
  variant?: 'pill' | 'menu-item'
}

export default function ThemeToggle({ variant = 'pill' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const resolved =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme

  function toggleMode() {
    const next = resolved === 'dark' ? 'light' : 'dark'
    setTheme(next)
  }

  const label =
    resolved === 'dark'
      ? 'Switch to light mode'
      : 'Switch to dark mode'

  if (variant === 'menu-item') {
    return (
      <button
        type="button"
        onClick={toggleMode}
        aria-label={label}
        title={label}
        className="w-full px-3 py-3 flex items-center gap-3 cursor-pointer rounded-md hover:bg-sidebar-accent/50 transition-colors text-sm font-medium"
      >
        {resolved === 'dark' ? (
          <>
            <Sun className="w-5 h-5 shrink-0" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-5 h-5 shrink-0" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={label}
      title={label}
      className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--sea-ink)] shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition hover:-translate-y-0.5"
    >
      {resolved === 'dark' ? 'Dark' : 'Light'}
    </button>
  )
}
