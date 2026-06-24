import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { THEME_OPTIONS, type ThemePreference } from '../lib/theme'
import { cn } from '../lib/utils'
import { toolbarTriggerClass } from './toolbar-trigger'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const THEME_META: Record<ThemePreference, { icon: typeof Sun }> = {
  light: { icon: Sun },
  dark: { icon: Moon },
  system: { icon: Monitor },
}

export function ThemeSwitcher() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const active = THEME_META[theme]
  const ActiveIcon = active.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t('theme.label')} className={toolbarTriggerClass}>
          <ActiveIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          <span className="hidden sm:inline">{t(`theme.${theme}`)}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-data-[state=open]:rotate-180 dark:text-zinc-500" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="bottom">
        <DropdownMenuLabel>{t('theme.label')}</DropdownMenuLabel>
        {THEME_OPTIONS.map((option) => {
          const meta = THEME_META[option]
          const Icon = meta.icon
          const selected = theme === option

          return (
            <DropdownMenuItem
              key={option}
              onSelect={() => setTheme(option)}
              className={cn(
                selected &&
                  'bg-violet-500/10 text-violet-700 focus:bg-violet-500/15 dark:text-violet-200',
              )}
            >
              <Icon className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2} />
              <span className="flex-1">{t(`theme.${option}`)}</span>
              {selected && (
                <Check className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2.5} />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

