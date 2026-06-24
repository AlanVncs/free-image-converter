import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import JSZip from 'jszip'
import { FormatSelector } from './components/FormatSelector'
import { FileDropzone } from './components/FileDropzone'
import { FileList } from './components/FileList'
import { AppToolbar } from './components/AppToolbar'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import type { ImageFile, OutputFormat } from './types/image'
import { convertImage } from './lib/convertImage'
import { createPreviewUrl } from './lib/decodeImage'
import {
  buildUniqueFilenames,
  downloadBlob,
} from './lib/downloadFiles'
import {
  FORMATS,
  getFormatById,
  getFormatLabels,
  isSupportedFile,
  OUTPUT_FORMATS,
} from './lib/formats'

function createId(): string {
  return crypto.randomUUID()
}

export default function App() {
  const { t } = useTranslation()
  useDocumentMeta()

  const [targetFormat, setTargetFormat] = useState<OutputFormat>('png')
  const outputFormatLabels = getFormatLabels(OUTPUT_FORMATS)
  const inputFormatLabels = getFormatLabels(FORMATS)
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const addFiles = useCallback(
    async (incoming: File[]) => {
      const valid = incoming.filter(isSupportedFile)
      if (valid.length < incoming.length) {
        alert(t('errors.unsupportedFiles'))
      }
      if (valid.length === 0) return

      const placeholders: ImageFile[] = valid.map((file) => ({
        id: createId(),
        file,
        previewUrl: '',
        status: 'loading',
      }))

      setFiles((prev) => [...prev, ...placeholders])

      await Promise.all(
        placeholders.map(async (placeholder) => {
          try {
            const previewUrl = await createPreviewUrl(placeholder.file)
            setFiles((prev) =>
              prev.map((f) =>
                f.id === placeholder.id ? { ...f, previewUrl, status: 'ready', error: undefined } : f,
              ),
            )
          } catch (err) {
            const message = err instanceof Error ? err.message : t('errors.previewFailed')
            setFiles((prev) =>
              prev.map((f) =>
                f.id === placeholder.id ? { ...f, status: 'error', error: message } : f,
              ),
            )
          }
        }),
      )
    },
    [t],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
      return []
    })
  }, [])

  const filesRef = useRef(files)
  filesRef.current = files

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => {
        if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
      })
    }
  }, [])

  const convertAll = async () => {
    const queue = files.filter((f) => f.status === 'ready' || f.status === 'error')
    if (queue.length === 0) return

    setIsConverting(true)

    for (const item of queue) {
      setFiles((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, status: 'converting', error: undefined } : f)),
      )

      try {
        const blob = await convertImage(item.file, targetFormat)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'done', convertedBlob: blob, error: undefined } : f,
          ),
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : t('errors.unknown')
        setFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, status: 'error', error: message } : f)),
        )
      }
    }

    setIsConverting(false)
  }

  const downloadAll = async () => {
    const done = files.filter((f) => f.status === 'done' && f.convertedBlob)
    if (done.length === 0) return

    const extension = getFormatById(targetFormat).extension
    const downloadItems = buildUniqueFilenames(
      done.map((item) => ({
        blob: item.convertedBlob!,
        originalName: item.file.name,
        extension,
      })),
    )

    if (done.length === 1) {
      downloadBlob(downloadItems[0].blob, downloadItems[0].filename)
      return
    }

    const zip = new JSZip()
    for (const { blob, filename } of downloadItems) {
      zip.file(filename, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, t('download.zipFilename', { extension }))
  }

  const readyCount = files.filter((f) => f.status === 'ready' || f.status === 'error').length
  const doneCount = files.filter((f) => f.status === 'done').length
  const canDownloadAll = doneCount > 0
  const downloadAllLabel =
    doneCount === 1 ? t('actions.downloadFile') : t('actions.downloadAllZip')

  return (
    <>
      <AppToolbar />

      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
            {t('header.badge')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            <Trans
              i18nKey="header.title"
              components={{ 1: <span className="text-violet-600 dark:text-violet-400" /> }}
            />
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {t('header.subtitle', { formats: outputFormatLabels })}
          </p>
        </header>

        <main className="space-y-6">
          <FormatSelector value={targetFormat} onChange={setTargetFormat} />
          <FileDropzone
            onFilesAdded={addFiles}
            disabled={isConverting}
            acceptedFormats={inputFormatLabels}
          />
          <FileList
            files={files}
            targetFormat={targetFormat}
            onRemove={removeFile}
            onClear={clearFiles}
          />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={convertAll}
                disabled={isConverting || readyCount === 0}
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting
                  ? t('actions.converting')
                  : readyCount > 0
                    ? t('actions.convertWithCount', { count: readyCount })
                    : t('actions.convert')}
              </button>
              {canDownloadAll && (
                <button
                  type="button"
                  onClick={downloadAll}
                  className="rounded-xl border border-zinc-300 bg-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-700"
                >
                  {downloadAllLabel}
                </button>
              )}
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-xs text-zinc-500 dark:text-zinc-600">
          {t('footer.privacy')}
        </footer>
      </div>
    </>
  )
}
