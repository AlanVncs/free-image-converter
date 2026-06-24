import i18n from '../i18n'
import { heicToPngBlob, isHeicFile } from './heic'

export async function loadImageBitmap(file: File): Promise<ImageBitmap> {
  if (!isHeicFile(file)) {
    return createImageBitmap(file)
  }

  try {
    return await createImageBitmap(file)
  } catch {
    try {
      const pngBlob = await heicToPngBlob(file)
      return createImageBitmap(pngBlob)
    } catch {
      throw new Error(i18n.t('errors.heicDecodeFailed'))
    }
  }
}

export async function createPreviewUrl(file: File): Promise<string> {
  if (!isHeicFile(file)) {
    return URL.createObjectURL(file)
  }

  try {
    const bitmap = await createImageBitmap(file)
    bitmap.close()
    return URL.createObjectURL(file)
  } catch {
    try {
      return URL.createObjectURL(await heicToPngBlob(file))
    } catch {
      return URL.createObjectURL(file)
    }
  }
}
