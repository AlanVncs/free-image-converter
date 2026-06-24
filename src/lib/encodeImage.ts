import type { OutputFormat } from '../types/image'
import { getFormatById } from './formats'

const LOSSY_FORMATS = new Set<OutputFormat>(['jpg', 'webp', 'avif'])
const LIBRARY_ENCODERS = new Set<OutputFormat>(['gif', 'bmp', 'ico'])
const ICO_MAX_SIZE = 256

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, mime, quality)
  })
}

function resizeCanvasForIco(source: HTMLCanvasElement): HTMLCanvasElement {
  if (source.width <= ICO_MAX_SIZE && source.height <= ICO_MAX_SIZE) return source

  const scale = ICO_MAX_SIZE / Math.max(source.width, source.height)
  const width = Math.max(1, Math.round(source.width * scale))
  const height = Math.max(1, Math.round(source.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context missing')

  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

function encodeIcoFromPng(pngBuffer: Uint8Array, width: number, height: number): Blob {
  const headerSize = 6 + 16
  const buffer = new ArrayBuffer(headerSize + pngBuffer.byteLength)
  const view = new DataView(buffer)
  const bytes = new Uint8Array(buffer)

  view.setUint16(0, 0, true)
  view.setUint16(2, 1, true)
  view.setUint16(4, 1, true)

  bytes[6] = width >= 256 ? 0 : width
  bytes[7] = height >= 256 ? 0 : height
  bytes[8] = 0
  bytes[9] = 0
  view.setUint16(10, 1, true)
  view.setUint16(12, 32, true)
  view.setUint32(14, pngBuffer.byteLength, true)
  view.setUint32(18, headerSize, true)

  bytes.set(pngBuffer, headerSize)
  return new Blob([buffer], { type: 'image/x-icon' })
}

async function encodeIco(canvas: HTMLCanvasElement): Promise<Blob> {
  const icoCanvas = resizeCanvasForIco(canvas)
  const pngBlob = await canvasToBlob(icoCanvas, 'image/png')
  if (!pngBlob) throw new Error('ICO PNG encoding failed')

  const pngBuffer = new Uint8Array(await pngBlob.arrayBuffer())
  return encodeIcoFromPng(pngBuffer, icoCanvas.width, icoCanvas.height)
}

async function encodeWithLibrary(canvas: HTMLCanvasElement, format: OutputFormat): Promise<Blob> {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context missing')

  switch (format) {
    case 'gif': {
      const { GIFEncoder, quantize, applyPalette } = await import('gifenc')
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const palette = quantize(data, 256)
      const index = applyPalette(data, palette)
      const gif = GIFEncoder()
      gif.writeFrame(index, width, height, { palette })
      gif.finish()
      return new Blob([new Uint8Array(gif.bytes())], { type: 'image/gif' })
    }
    case 'bmp': {
      const { encode: encodeBmp } = await import('fast-bmp')
      const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const encoded = encodeBmp({
        width,
        height,
        data,
        bitsPerPixel: 32,
        components: 4,
        channels: 4,
      })
      return new Blob([new Uint8Array(encoded)], { type: 'image/bmp' })
    }
    case 'ico':
      return encodeIco(canvas)
    default:
      throw new Error(`No library encoder for ${format}`)
  }
}

export async function encodeCanvas(
  canvas: HTMLCanvasElement,
  targetFormat: OutputFormat,
  quality = 0.92,
): Promise<Blob> {
  if (LIBRARY_ENCODERS.has(targetFormat)) {
    return encodeWithLibrary(canvas, targetFormat)
  }

  const format = getFormatById(targetFormat)
  const blobQuality = LOSSY_FORMATS.has(targetFormat) ? quality : undefined
  const blob = await canvasToBlob(canvas, format.mime, blobQuality)
  if (!blob) {
    throw new Error(targetFormat === 'avif' ? 'avif-unsupported' : 'conversion-failed')
  }
  return blob
}
