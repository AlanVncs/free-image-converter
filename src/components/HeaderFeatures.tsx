import { useTranslation } from 'react-i18next'

const FEATURES = ['simple', 'fast', 'free', 'secure'] as const

export function HeaderFeatures() {
  const { t } = useTranslation()

  return (
    <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1 text-sm text-zinc-600 dark:text-zinc-400">
      {FEATURES.map((key, index) => (
        <span key={key} className="inline-flex items-center">
          {index > 0 && (
            <span aria-hidden="true" className="mx-2 text-zinc-300 dark:text-zinc-600">
              ·
            </span>
          )}
          <span className="group relative inline-block">
            <span className="cursor-default border-b border-dotted border-zinc-400/70 dark:border-zinc-500/70">
              {t(`header.features.${key}.label`)}
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-zinc-800 px-3 py-2 text-left text-xs leading-snug text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 dark:bg-zinc-700"
            >
              {t(`header.features.${key}.hint`)}
            </span>
          </span>
        </span>
      ))}
    </p>
  )
}
