import type { ImageFormat } from '../types/image'

export type FormatInfo = {
  id: ImageFormat
  label: string
  mime: string
  extension: string
  accept: string[]
}

export const FORMATS: FormatInfo[] = [
  {
    id: 'png',
    label: 'PNG',
    mime: 'image/png',
    extension: 'png',
    accept: ['image/png', '.png'],
  },
  {
    id: 'avif',
    label: 'AVIF',
    mime: 'image/avif',
    extension: 'avif',
    accept: ['image/avif', '.avif'],
  },
  {
    id: 'jpg',
    label: 'JPG',
    mime: 'image/jpeg',
    extension: 'jpg',
    accept: ['image/jpeg', 'image/jpg', '.jpg', '.jpeg'],
  },
  {
    id: 'webp',
    label: 'WEBP',
    mime: 'image/webp',
    extension: 'webp',
    accept: ['image/webp', '.webp'],
  },
]

export const SUPPORTED_MIME_TYPES = new Set(
  FORMATS.flatMap((f) => f.accept.filter((a) => a.startsWith('image/'))),
)

export function getFormatById(id: ImageFormat): FormatInfo {
  const format = FORMATS.find((f) => f.id === id)
  if (!format) throw new Error(`Unknown format: ${id}`)
  return format
}

export function isSupportedFile(file: File): boolean {
  if (SUPPORTED_MIME_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return FORMATS.some((f) => f.extension === ext)
}

export function getAcceptString(): string {
  return FORMATS.flatMap((f) => f.accept).join(',')
}

export function replaceExtension(filename: string, newExt: string): string {
  const base = filename.replace(/\.[^.]+$/, '')
  return `${base}.${newExt}`
}
