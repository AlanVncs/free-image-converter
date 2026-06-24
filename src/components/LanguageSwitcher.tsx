import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../i18n'
import { SUPPORTED_LANGUAGES } from '../i18n'
import { cn } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

const LANGUAGE_META: Record<SupportedLanguage, { flag: string; short: string }> = {
  'pt-BR': { flag: '🇧🇷', short: 'PT' },
  en: { flag: '🇺🇸', short: 'EN' },
}

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const current = i18n.language as SupportedLanguage
  const active = LANGUAGE_META[current] ?? LANGUAGE_META.en

  const changeLanguage = (lng: SupportedLanguage) => {
    void i18n.changeLanguage(lng)
  }

  return (
    <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={t('language.label')}
            className={cn(
              'group inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2',
              'text-sm font-medium text-zinc-200 shadow-lg shadow-black/20 backdrop-blur-md',
              'transition-all hover:border-zinc-700 hover:bg-zinc-800/90',
              'focus-visible:border-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40',
              'data-[state=open]:border-violet-500/50 data-[state=open]:bg-zinc-800/90 data-[state=open]:ring-2 data-[state=open]:ring-violet-500/20',
            )}
          >
            <Globe className="h-4 w-4 text-violet-400" strokeWidth={2} />
            <span className="hidden sm:inline">{active.flag}</span>
            <span>{active.short}</span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500 transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuLabel>{t('language.label')}</DropdownMenuLabel>
          {SUPPORTED_LANGUAGES.map((lng) => {
            const meta = LANGUAGE_META[lng]
            const selected = current === lng

            return (
              <DropdownMenuItem
                key={lng}
                onSelect={() => changeLanguage(lng)}
                className={cn(selected && 'bg-violet-500/10 text-violet-200 focus:bg-violet-500/15')}
              >
                <span className="text-base leading-none">{meta.flag}</span>
                <span className="flex-1">{t(`language.${lng}`)}</span>
                {selected && <Check className="h-4 w-4 text-violet-400" strokeWidth={2.5} />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
