import { Check, ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../i18n'
import { SUPPORTED_LANGUAGES } from '../i18n'
import { cn } from '../lib/utils'
import { toolbarTriggerClass } from './toolbar-trigger'
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={t('language.label')} className={toolbarTriggerClass}>
          <Globe className="h-4 w-4 text-violet-600 dark:text-violet-400" strokeWidth={2} />
          <span className="hidden sm:inline">{active.flag}</span>
          <span>{active.short}</span>
          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 transition-transform group-data-[state=open]:rotate-180 dark:text-zinc-500" />
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
              className={cn(
                selected &&
                  'bg-violet-500/10 text-violet-700 focus:bg-violet-500/15 dark:text-violet-200',
              )}
            >
              <span className="text-base leading-none">{meta.flag}</span>
              <span className="flex-1">{t(`language.${lng}`)}</span>
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
