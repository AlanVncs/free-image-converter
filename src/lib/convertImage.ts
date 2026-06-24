import i18n from '../i18n'
import { loadImageBitmap } from './decodeImage'
import { encodeCanvas } from './encodeImage'
import type { OutputFormat } from '../types/image'

export async function convertImage(file: File, targetFormat: OutputFormat): Promise<Blob> {
  const bitmap = await loadImageBitmap(file)

  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error(i18n.t('errors.canvasContext'))

    ctx.drawImage(bitmap, 0, 0)

    try {
      return await encodeCanvas(canvas, targetFormat)
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'avif-unsupported') {
          throw new Error(i18n.t('errors.avifUnsupported'))
        }
        if (err.message === 'conversion-failed') {
          throw new Error(i18n.t('errors.conversionFailed'))
        }
      }
      throw err
    }
  } finally {
    bitmap.close()
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
