import { useTranslation } from 'react-i18next'
import { Download, Loader2, X } from 'lucide-react'
import type { ImageFile, ImageFileStatus, OutputFormat } from '../types/image'
import { getFormatById } from '../lib/formats'
import { downloadBlob } from '../lib/downloadFiles'
import { replaceExtension } from '../lib/formats'
import { cn } from '../lib/utils'

type FileListProps = {
  files: ImageFile[]
  onRemove: (id: string) => void
  onClear: () => void
}

const sectionClass =
  'rounded-2xl border border-zinc-200 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/60'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const STATUS_STYLES: Record<ImageFileStatus, string> = {
  loading: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  ready: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  converting: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  done: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  error: 'bg-red-500/20 text-red-700 dark:text-red-300',
}

function StatusBadge({ status, error }: Pick<ImageFile, 'status' | 'error'>) {
  const { t } = useTranslation()
  const isAnimated = status === 'loading' || status === 'converting'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
      )}
      title={error}
    >
      {isAnimated && <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.5} />}
      {t(`files.status.${status}`)}
    </span>
  )
}

function FilePreview({ item }: { item: ImageFile }) {
  if (item.status === 'loading' || !item.previewUrl) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-700">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-500 dark:text-zinc-400" />
      </div>
    )
  }

  return (
    <img
      src={item.previewUrl}
      alt={item.file.name}
      className="h-14 w-14 shrink-0 rounded-lg object-cover"
    />
  )
}

function getConvertedSize(outputs: ImageFile['convertedOutputs']): number {
  if (!outputs) return 0
  return Object.values(outputs).reduce((sum, blob) => sum + blob.size, 0)
}

export function FileList({ files, onRemove, onClear }: FileListProps) {
  const { t } = useTranslation()

  if (files.length === 0) return null

  const handleDownload = (item: ImageFile, format: OutputFormat) => {
    const blob = item.convertedOutputs?.[format]
    if (!blob) return
    const extension = getFormatById(format).extension
    downloadBlob(blob, replaceExtension(item.file.name, extension))
  }

  return (
    <section className={sectionClass}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t('files.title', { count: files.length })}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-800 dark:hover:text-zinc-300"
        >
          {t('files.clearAll')}
        </button>
      </div>

      <ul className="space-y-3">
        {files.map((item) => {
          const convertedEntries = Object.entries(item.convertedOutputs ?? {}) as [
            OutputFormat,
            Blob,
          ][]

          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 sm:gap-4 dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <FilePreview item={item} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {item.file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatBytes(item.file.size)}
                  {convertedEntries.length > 0 && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {' '}
                      → {formatBytes(getConvertedSize(item.convertedOutputs))}
                    </span>
                  )}
                </p>
                <div className="mt-1.5 sm:hidden">
                  <StatusBadge status={item.status} error={item.error} />
                </div>
                {item.error && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{item.error}</p>
                )}
              </div>
              <div className="hidden shrink-0 sm:block">
                <StatusBadge status={item.status} error={item.error} />
              </div>
              {item.status === 'done' && convertedEntries.length > 0 && (
                <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                  {convertedEntries.map(([format]) => (
                    <button
                      key={format}
                      type="button"
                      onClick={() => handleDownload(item, format)}
                      className="inline-flex items-center gap-1 rounded-lg bg-violet-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
                      aria-label={t('files.downloadFormat', {
                        name: item.file.name,
                        format: getFormatById(format).label,
                      })}
                    >
                      <Download className="h-3 w-3" strokeWidth={2.5} />
                      {getFormatById(format).label}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                disabled={item.status === 'loading' || item.status === 'converting'}
                className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                aria-label={t('files.remove', { name: item.file.name })}
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
