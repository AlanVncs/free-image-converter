import i18n from '../i18n'
import { getFormatById } from './formats'
import type { ImageFormat } from '../types/image'

const LOSSY_FORMATS = new Set<ImageFormat>(['jpg', 'webp', 'avif'])
const DEFAULT_QUALITY = 0.92

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
): Promise<Blob> {
  const format = getFormatById(targetFormat)
  const bitmap = await createImageBitmap(file)

  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error(i18n.t('errors.canvasContext'))

    ctx.drawImage(bitmap, 0, 0)

    const quality = LOSSY_FORMATS.has(targetFormat) ? DEFAULT_QUALITY : undefined
    const blob = await canvasToBlob(canvas, format.mime, quality)

    if (!blob) {
      if (targetFormat === 'avif') {
        throw new Error(i18n.t('errors.avifUnsupported'))
      }
      throw new Error(i18n.t('errors.conversionFailed'))
    }

    return blob
  } finally {
    bitmap.close()
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality)
  })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
