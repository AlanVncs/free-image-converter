import { useTranslation } from 'react-i18next'
import type { ImageFile } from '../types/image'
import { getFormatById } from '../lib/formats'
import type { ImageFormat } from '../types/image'
import { downloadBlob } from '../lib/convertImage'
import { replaceExtension } from '../lib/formats'

type FileListProps = {
  files: ImageFile[]
  targetFormat: ImageFormat
  onRemove: (id: string) => void
  onClear: () => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function StatusBadge({ status, error }: Pick<ImageFile, 'status' | 'error'>) {
  const { t } = useTranslation()

  const styles: Record<ImageFile['status'], string> = {
    pending: 'bg-zinc-700 text-zinc-300',
    converting: 'bg-amber-500/20 text-amber-300',
    done: 'bg-emerald-500/20 text-emerald-300',
    error: 'bg-red-500/20 text-red-300',
  }

  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      title={error}
    >
      {t(`files.status.${status}`)}
    </span>
  )
}

export function FileList({ files, targetFormat, onRemove, onClear }: FileListProps) {
  const { t } = useTranslation()

  if (files.length === 0) return null

  const extension = getFormatById(targetFormat).extension

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
            {t('files.title', { count: files.length })}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {t('files.clearAll')}
        </button>
      </div>

      <ul className="space-y-3">
        {files.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-800/40 p-3"
          >
            <img
              src={item.previewUrl}
              alt={item.file.name}
              className="h-14 w-14 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{item.file.name}</p>
              <p className="text-xs text-zinc-500">
                {formatBytes(item.file.size)}
                {item.convertedBlob && (
                  <span className="text-emerald-400">
                    {' '}
                    → {formatBytes(item.convertedBlob.size)}
                  </span>
                )}
              </p>
              {item.error && <p className="mt-1 text-xs text-red-400">{item.error}</p>}
            </div>
            <StatusBadge status={item.status} error={item.error} />
            {item.status === 'done' && item.convertedBlob && (
              <button
                type="button"
                onClick={() =>
                  downloadBlob(
                    item.convertedBlob!,
                    replaceExtension(item.file.name, extension),
                  )
                }
                className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
              >
                {t('files.download')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
              aria-label={t('files.remove', { name: item.file.name })}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
