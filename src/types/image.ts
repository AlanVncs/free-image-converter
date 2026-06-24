export type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif' | 'gif' | 'bmp' | 'ico'

export type InputFormat = OutputFormat | 'svg' | 'heic'

export type ImageFileStatus = 'loading' | 'ready' | 'converting' | 'done' | 'error'

export type ImageFile = {
  id: string
  file: File
  previewUrl: string
  status: ImageFileStatus
  convertedBlob?: Blob
  error?: string
}
