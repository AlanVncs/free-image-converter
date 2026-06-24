export function isHeicFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'heic' || ext === 'heif') return true
  const type = file.type.toLowerCase()
  return type === 'image/heic' || type === 'image/heif'
}

export async function heicToPngBlob(file: File): Promise<Blob> {
  const { default: heic2any } = await import('heic2any')
  const result = await heic2any({ blob: file, toType: 'image/png' })
  const blob = Array.isArray(result) ? result[0] : result
  if (!blob) throw new Error('HEIC decode returned empty result')
  return blob
}
