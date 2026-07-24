/**
 * 图片压缩工具 — 浏览器端 Canvas 压缩
 */
export async function compressImage(
  file: File,
  maxW: number,
  format: 'image/jpeg' | 'image/png',
  quality: number
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > maxW) { h = Math.round(h * maxW / w); w = maxW }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      canvas.toBlob((b) => {
        if (b && b.size < file.size) {
          resolve(new File([b], file.name, { type: format }))
        } else {
          resolve(file)
        }
      }, format, quality)
    }
    img.src = URL.createObjectURL(file)
  })
}

/** 封面（1200px, JPEG 80%） */
export function compressCover(file: File) {
  return compressImage(file, 1200, 'image/jpeg', 0.8)
}

/** 立绘（1920px, PNG 保持透明） */
export function compressSprite(file: File) {
  return compressImage(file, 1920, 'image/png', 0.9)
}
