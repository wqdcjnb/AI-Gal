'use client'

import { useState, useCallback } from 'react'
import { ZoomIn, ZoomOut } from 'lucide-react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'

function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.src = imageSrc
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('crop failed')), 'image/png')
    }
    img.onerror = reject
  })
}

export function AvatarCropDialog({
  imageSrc,
  onConfirm,
  onCancel,
}: {
  imageSrc: string
  onConfirm: (blob: Blob) => void
  onCancel: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    setUploading(true)
    const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
    onConfirm(blob)
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden mx-4 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="relative h-80 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div className="p-4 flex items-center gap-4">
          <ZoomOut className="h-4 w-4 text-muted-foreground shrink-0" />
          <input type="range" min={1} max={3} step={0.01}
            value={zoom} onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-purple-400" />
          <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
        </div>
        <div className="flex gap-3 px-4 pb-4">
          <button onClick={onCancel} className="flex-1 rounded-lg border py-2 text-sm">取消</button>
          <button onClick={handleConfirm} disabled={uploading}
            className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50">
            {uploading ? '上传中...' : '确认裁剪'}
          </button>
        </div>
      </div>
    </div>
  )
}
