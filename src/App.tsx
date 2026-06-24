import { useCallback, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import JSZip from 'jszip'
import { FormatSelector } from './components/FormatSelector'
import { FileDropzone } from './components/FileDropzone'
import { FileList } from './components/FileList'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { useDocumentMeta } from './hooks/useDocumentMeta'
import type { ImageFile, ImageFormat } from './types/image'
import { convertImage, downloadBlob } from './lib/convertImage'
import { getFormatById, isSupportedFile, replaceExtension } from './lib/formats'

function createId(): string {
  return crypto.randomUUID()
}

export default function App() {
  const { t } = useTranslation()
  useDocumentMeta()

  const [targetFormat, setTargetFormat] = useState<ImageFormat>('png')
  const [files, setFiles] = useState<ImageFile[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const addFiles = useCallback(
    (incoming: File[]) => {
      const valid = incoming.filter(isSupportedFile)
      if (valid.length < incoming.length) {
        alert(t('errors.unsupportedFiles'))
      }
      if (valid.length === 0) return

      const newItems: ImageFile[] = valid.map((file) => ({
        id: createId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
      }))

      setFiles((prev) => [...prev, ...newItems])
    },
    [t],
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.previewUrl))
      return []
    })
  }, [])

  const filesRef = useRef(files)
  filesRef.current = files

  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => URL.revokeObjectURL(f.previewUrl))
    }
  }, [])

  const convertAll = async () => {
    const pending = files.filter((f) => f.status === 'pending' || f.status === 'error')
    if (pending.length === 0) return

    setIsConverting(true)

    for (const item of pending) {
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

    if (done.length === 1) {
      downloadBlob(
        done[0].convertedBlob!,
        replaceExtension(done[0].file.name, extension),
      )
      return
    }

    const zip = new JSZip()
    const usedNames = new Set<string>()

    for (const item of done) {
      let name = replaceExtension(item.file.name, extension)
      if (usedNames.has(name)) {
        const base = name.replace(/\.[^.]+$/, '')
        let counter = 2
        while (usedNames.has(`${base}-${counter}.${extension}`)) counter++
        name = `${base}-${counter}.${extension}`
      }
      usedNames.add(name)
      zip.file(name, item.convertedBlob!)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(zipBlob, t('download.zipFilename', { extension }))
  }

  const pendingCount = files.filter((f) => f.status === 'pending' || f.status === 'error').length
  const doneCount = files.filter((f) => f.status === 'done').length

  return (
    <>
      <LanguageSwitcher />

      <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
        <header className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            {t('header.badge')}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <Trans
              i18nKey="header.title"
              components={{ 1: <span className="text-violet-400" /> }}
            />
          </h1>
          <p className="mt-2 text-zinc-400">{t('header.subtitle')}</p>
        </header>

        <main className="space-y-6">
          <FormatSelector value={targetFormat} onChange={setTargetFormat} />
          <FileDropzone onFilesAdded={addFiles} disabled={isConverting} />
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
                disabled={isConverting || pendingCount === 0}
                className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isConverting
                  ? t('actions.converting')
                  : pendingCount > 0
                    ? t('actions.convertWithCount', { count: pendingCount })
                    : t('actions.convert')}
              </button>
              {doneCount > 0 && (
                <button
                  type="button"
                  onClick={downloadAll}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-700"
                >
                  {doneCount > 1 ? t('actions.downloadAllZip') : t('actions.downloadFile')}
                </button>
              )}
            </div>
          )}
        </main>

        <footer className="mt-16 text-center text-xs text-zinc-600">{t('footer.privacy')}</footer>
      </div>
    </>
  )
}
