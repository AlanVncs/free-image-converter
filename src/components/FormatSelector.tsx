import { useTranslation } from 'react-i18next'
import type { OutputFormat } from '../types/image'
import { OUTPUT_FORMATS } from '../lib/formats'

type FormatSelectorProps = {
  value: OutputFormat[]
  onChange: (formats: OutputFormat[]) => void
}

const sectionClass =
  'rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/60'

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const { t } = useTranslation()

  const toggleFormat = (format: OutputFormat) => {
    if (value.includes(format)) {
      if (value.length === 1) return
      onChange(value.filter((f) => f !== format))
      return
    }
    onChange([...value, format])
  }

  return (
    <section className={sectionClass}>
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
        {t('formatSelector.title')}
      </h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-500">{t('formatSelector.description')}</p>
      <div className="flex flex-wrap justify-start gap-2">
        {OUTPUT_FORMATS.map((format) => {
          const selected = value.includes(format.id)
          return (
            <button
              key={format.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggleFormat(format.id)}
              className={[
                'w-[4.25rem] rounded-lg border px-2 py-2 text-center transition-all',
                selected
                  ? 'border-violet-500 bg-violet-500/10 text-violet-700 shadow-[0_0_20px_rgba(139,92,246,0.12)] dark:bg-violet-500/15 dark:text-violet-200 dark:shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800',
              ].join(' ')}
            >
              <span className="block text-sm font-semibold">{format.label}</span>
              <span className="mt-0.5 block text-[11px] text-zinc-500">.{format.extension}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
