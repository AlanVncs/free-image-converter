import { replaceExtension } from './formats'

export type DownloadItem = {
  blob: Blob
  filename: string
}

export function buildUniqueFilenames(
  items: { blob: Blob; originalName: string; extension: string }[],
): DownloadItem[] {
  const usedNames = new Set<string>()

  return items.map(({ blob, originalName, extension }) => {
    let filename = replaceExtension(originalName, extension)
    if (usedNames.has(filename)) {
      const base = filename.replace(/\.[^.]+$/, '')
      let counter = 2
      while (usedNames.has(`${base}-${counter}.${extension}`)) counter++
      filename = `${base}-${counter}.${extension}`
    }
    usedNames.add(filename)
    return { blob, filename }
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
