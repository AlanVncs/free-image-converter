import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import JSZip from 'jszip'
import { FormatSelector } from './components/FormatSelector'
import { FileDropzone } from './components/FileDropzone'
import { FileList } from './components/FileList'
import { AppToolbar } from './components/AppToolbar'
import { HeaderFeatures } from './components/HeaderFeatures'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import type { ImageFile, OutputFormat } from './types/image'
import { convertImageToFormats } from './lib/convertImage'
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
} from './lib/formats'

function createId(): string {
  return crypto.randomUUID()
}

function countConvertedOutputs(files: ImageFile[]): number {
  return files.reduce((count, file) => count + Object.keys(file.convertedOutputs ?? {}).length, 0)
}

export default function App() {
  const { t } = useTranslation()
  useDocumentMeta()

  const [targetFormats, setTargetFormats] = useState<OutputFormat[]>(['png'])
  const inputFormatLabels = getFormatLabels(FORMATS)
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const handleTargetFormatsChange = useCallback((formats: OutputFormat[]) => {
    setTargetFormats(formats)
    setFiles((prev) =>
      prev.map((file) =>
        file.status === 'done' || file.status === 'error'
          ? {
              ...file,
              status: 'ready',
              convertedOutputs: undefined,
              error: undefined,
            }
          : file,
      ),
    )
  }, [])

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
    if (queue.length === 0 || targetFormats.length === 0) return

    setIsConverting(true)

    for (const item of queue) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'converting', convertedOutputs: undefined, error: undefined }
            : f,
        ),
      )

      try {
        const { outputs, errors } = await convertImageToFormats(item.file, targetFormats)
        const outputCount = Object.keys(outputs).length
        const errorMessages = Object.entries(errors).map(
          ([format, message]) => `${getFormatById(format as OutputFormat).label}: ${message}`,
        )

        if (outputCount === 0) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: 'error',
                    error: errorMessages.join(' · ') || t('errors.conversionFailed'),
                  }
                : f,
            ),
          )
          continue
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  status: 'done',
                  convertedOutputs: outputs,
                  error: errorMessages.length > 0 ? errorMessages.join(' · ') : undefined,
                }
              : f,
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
    const done = files.filter(
      (f) => f.status === 'done' && f.convertedOutputs && Object.keys(f.convertedOutputs).length > 0,
    )
    if (done.length === 0) return

    const downloadItems = buildUniqueFilenames(
      done.flatMap((item) =>
        Object.entries(item.convertedOutputs!).map(([format, blob]) => ({
          blob,
          originalName: item.file.name,
          extension: getFormatById(format as OutputFormat).extension,
        })),
      ),
    )

    if (downloadItems.length === 1) {
      downloadBlob(downloadItems[0].blob, downloadItems[0].filename)
      return
    }

    const zip = new JSZip()
    for (const { blob, filename } of downloadItems) {
      zip.file(filename, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, t('download.zipFilename'))
  }

  const readyCount = files.filter((f) => f.status === 'ready' || f.status === 'error').length
  const outputCount = countConvertedOutputs(files)
  const canDownloadAll = outputCount > 0
  const downloadAllLabel =
    outputCount === 1 ? t('actions.downloadFile') : t('actions.downloadAllZip')

  return (
    <>
      <AppToolbar />

      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-white">
            {t('header.title')}
          </h1>
          <HeaderFeatures />
        </header>

        <main className="space-y-6">
          <FormatSelector value={targetFormats} onChange={handleTargetFormatsChange} />
          <FileDropzone
            onFilesAdded={addFiles}
            disabled={isConverting}
            acceptedFormats={inputFormatLabels}
          />
          <FileList files={files} onRemove={removeFile} onClear={clearFiles} />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={convertAll}
                disabled={isConverting || readyCount === 0 || targetFormats.length === 0}
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
          <p>
            {t('footer.reportBugPrefix')}{' '}
            <a
              href="https://github.com/AlanVncs/free-image-converter/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 underline underline-offset-2 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
            >
              {t('footer.reportBugLink')}
            </a>
          </p>
        </footer>
      </div>
    </>
  )
}
