import i18n from '../i18n'
import { loadImageBitmap } from './decodeImage'
import { encodeCanvas } from './encodeImage'
import type { ConvertedOutputs, OutputFormat } from '../types/image'

function mapEncodeError(err: unknown): string {
  if (err instanceof Error) {
    if (err.message === 'avif-unsupported') return i18n.t('errors.avifUnsupported')
    if (err.message === 'conversion-failed') return i18n.t('errors.conversionFailed')
    return err.message
  }
  return i18n.t('errors.unknown')
}

export type ConversionResult = {
  outputs: ConvertedOutputs
  errors: Partial<Record<OutputFormat, string>>
}

export async function convertImageToFormats(
  file: File,
  targetFormats: OutputFormat[],
): Promise<ConversionResult> {
  const bitmap = await loadImageBitmap(file)

  try {
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error(i18n.t('errors.canvasContext'))

    ctx.drawImage(bitmap, 0, 0)

    const outputs: ConvertedOutputs = {}
    const errors: Partial<Record<OutputFormat, string>> = {}

    for (const targetFormat of targetFormats) {
      try {
        outputs[targetFormat] = await encodeCanvas(canvas, targetFormat)
      } catch (err) {
        errors[targetFormat] = mapEncodeError(err)
      }
    }

    return { outputs, errors }
  } finally {
    bitmap.close()
  }
}
