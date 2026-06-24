import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getAcceptString } from '../lib/formats'

type FileDropzoneProps = {
  onFilesAdded: (files: File[]) => void
  disabled?: boolean
}

export function FileDropzone({ onFilesAdded, disabled }: FileDropzoneProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return
      onFilesAdded(Array.from(fileList))
    },
    [onFilesAdded],
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
      <h2 className="mb-1 text-sm font-medium uppercase tracking-wider text-zinc-400">
        {t('dropzone.title')}
      </h2>
      <p className="mb-4 text-sm text-zinc-500">{t('dropzone.description')}</p>

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 transition-colors',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          isDragging
            ? 'border-violet-400 bg-violet-500/10'
            : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50',
        ].join(' ')}
      >
        <svg
          className="mb-4 h-12 w-12 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-center text-zinc-300">
          <span className="font-medium text-violet-400">{t('dropzone.clickToUpload')}</span>{' '}
          {t('dropzone.orDragHere')}
        </p>
        <p className="mt-2 text-xs text-zinc-500">{t('dropzone.multipleHint')}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={getAcceptString()}
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
    </section>
  )
}
