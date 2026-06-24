export type ImageFormat = 'png' | 'avif' | 'jpg' | 'webp'

export type ImageFile = {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'converting' | 'done' | 'error'
  convertedBlob?: Blob
  error?: string
}
