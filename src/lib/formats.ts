import type { InputFormat, OutputFormat } from '../types/image'

export type FormatInfo = {
  id: InputFormat
  label: string
  mime: string
  extension: string
  accept: string[]
  canOutput: boolean
}

export const FORMATS: FormatInfo[] = [
  {
    id: 'png',
    label: 'PNG',
    mime: 'image/png',
    extension: 'png',
    accept: ['image/png', '.png'],
    canOutput: true,
  },
  {
    id: 'jpg',
    label: 'JPG',
    mime: 'image/jpeg',
    extension: 'jpg',
    accept: ['image/jpeg', 'image/jpg', '.jpg', '.jpeg'],
    canOutput: true,
  },
  {
    id: 'webp',
    label: 'WEBP',
    mime: 'image/webp',
    extension: 'webp',
    accept: ['image/webp', '.webp'],
    canOutput: true,
  },
  {
    id: 'avif',
    label: 'AVIF',
    mime: 'image/avif',
    extension: 'avif',
    accept: ['image/avif', '.avif'],
    canOutput: true,
  },
  {
    id: 'gif',
    label: 'GIF',
    mime: 'image/gif',
    extension: 'gif',
    accept: ['image/gif', '.gif'],
    canOutput: true,
  },
  {
    id: 'bmp',
    label: 'BMP',
    mime: 'image/bmp',
    extension: 'bmp',
    accept: ['image/bmp', '.bmp'],
    canOutput: true,
  },
  {
    id: 'ico',
    label: 'ICO',
    mime: 'image/x-icon',
    extension: 'ico',
    accept: ['image/x-icon', 'image/vnd.microsoft.icon', '.ico'],
    canOutput: true,
  },
  {
    id: 'svg',
    label: 'SVG',
    mime: 'image/svg+xml',
    extension: 'svg',
    accept: ['image/svg+xml', '.svg'],
    canOutput: false,
  },
  {
    id: 'heic',
    label: 'HEIC',
    mime: 'image/heic',
    extension: 'heic',
    accept: ['image/heic', 'image/heif', '.heic', '.heif'],
    canOutput: false,
  },
]

export const OUTPUT_FORMATS = FORMATS.filter((f): f is FormatInfo & { id: OutputFormat } => f.canOutput)

const INPUT_MIME_TYPES = new Set(
  FORMATS.flatMap((f) => f.accept.filter((a) => a.startsWith('image/'))),
)

export function getFormatById(id: OutputFormat): FormatInfo {
  const format = OUTPUT_FORMATS.find((f) => f.id === id)
  if (!format) throw new Error(`Unknown format: ${id}`)
  return format
}

export function getFormatLabels(formats: FormatInfo[]): string {
  return formats.map((f) => f.label).join(', ')
}

export function isSupportedFile(file: File): boolean {
  if (file.type && INPUT_MIME_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!ext) return false
  return FORMATS.some(
    (f) => f.extension === ext || f.accept.some((a) => a === `.${ext}`),
  )
}

export function getAcceptString(): string {
  return FORMATS.flatMap((f) => f.accept).join(',')
}

export function replaceExtension(filename: string, newExt: string): string {
  const base = filename.replace(/\.[^.]+$/, '')
  return `${base}.${newExt}`
}
