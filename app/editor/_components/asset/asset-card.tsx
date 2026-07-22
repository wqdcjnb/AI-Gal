'use client'

import { useState, useEffect } from 'react'
import { Download, X, ImageIcon, Eye, Music2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetItem, AssetCategory } from '@/app/editor/_lib/types'

function ImageSize({ url }: { url: string }) {
  const [size, setSize] = useState('')
  useEffect(() => {
    if (!url) return
    const img = new window.Image()
    img.onload = () => setSize(`${img.width}×${img.height}`)
    img.src = url
  }, [url])
  return <span>{size || '...'}</span>
}

export function AssetCard({ asset, category, colors, gradient, onDelete, onRename, onPlay }: {
  asset: AssetItem
  category: AssetCategory
  colors: { bg: string; text: string; border: string; light: string; gradient: string }
  gradient: string
  onDelete?: () => void
  onRename?: (name: string) => void
  onPlay?: (asset: AssetItem) => void
}) {
  const isAudio = category === 'bgm' || category === 'se'
  const isImage = !isAudio && !!asset.url
  const [preview, setPreview] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(asset.name)
  const [showDelete, setShowDelete] = useState(false)

  function formatFromUrl(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase() || ''
    return ext || '音频'
  }

  function formatFileSize(bytes: number): string {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }

  const handleAudioClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPlay?.(asset)
  }

  const saveName = () => {
    const name = editName.trim()
    if (name && name !== asset.name) onRename?.(name)
    else setEditName(asset.name)
    setEditing(false)
  }

  return (
    <>
      <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-pink-200 hover:shadow-md transition-all cursor-pointer">
        {/* Preview area */}
        <div
          className={cn('relative bg-gradient-to-br', gradient, 'flex items-center justify-center overflow-hidden',
            isAudio ? 'aspect-square' : 'aspect-video')}
          onClick={() => { if (isImage) setPreview(true) }}
        >
          {isAudio ? (
            /* Audio card: click to open player */
            <div className="flex flex-col items-center justify-center gap-3 w-full h-full cursor-pointer" onClick={handleAudioClick}>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-muted-foreground group-hover:scale-110 transition-transform">
                {category === 'bgm' ? <Music2 className="h-7 w-7" /> :
                 <Volume2 className="h-7 w-7" />}
              </div>
              <span className="text-[10px] text-muted-foreground bg-white/60 rounded px-1.5 py-0.5">{formatFromUrl(asset.url)}</span>
              {/* 右上角：删除 */}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              )}
              {/* 右下角：下载 */}
              <a href={asset.url} download={asset.name} onClick={e => e.stopPropagation()}
                className="absolute bottom-1 right-1 rounded bg-sky-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-600">
                <Download className="h-3 w-3" />
              </a>
              {/* 删除确认 */}
              {showDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={(e) => { e.stopPropagation(); setShowDelete(false) }}>
                  <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-semibold">确认删除</h3>
                    <p className="mt-1 text-xs text-muted-foreground">确定要删除「{asset.name}」吗？</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setShowDelete(false) }} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowDelete(false) }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : isImage ? (
            /* Real image preview — 和立绘画廊一致 */
            <>
              <img src={asset.url} alt={asset.name}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-zoom-in" />
              {/* 左下角：图片尺寸 */}
              <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageSize url={asset.url} />
              </div>
              {/* 右下角：下载 */}
              <a href={asset.url} download={asset.name} onClick={e => e.stopPropagation()}
                className="absolute bottom-1 right-1 rounded bg-sky-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-600">
                <Download className="h-3 w-3" />
              </a>
              {/* 右上角：删除 */}
              {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
              )}
              {/* 删除确认 */}
              {showDelete && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40" onClick={(e) => { e.stopPropagation(); setShowDelete(false) }}>
                  <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-semibold">确认删除</h3>
                    <p className="mt-1 text-xs text-muted-foreground">确定要删除「{asset.name}」吗？</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setShowDelete(false) }} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete?.(); setShowDelete(false) }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Image placeholder when no url */
            <div className="flex flex-col items-center gap-2">
              {category === 'background' ? <ImageIcon className="h-8 w-8 text-emerald-400/60" /> :
               <Eye className="h-8 w-8 text-amber-400/60" />}
              <span className="text-xs text-muted-foreground/60">{asset.name}</span>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="px-3 py-2">
          {editing ? (
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName() }}
              className="text-xs font-medium w-full rounded border px-1 py-0.5 outline-none focus:border-pink-300"
              autoFocus onClick={e => e.stopPropagation()} />
          ) : (
            <h4 className="text-xs font-medium text-foreground truncate cursor-pointer hover:text-pink-500"
              onClick={e => { e.stopPropagation(); setEditing(true); setEditName(asset.name) }}>
              {asset.name}
            </h4>
          )}
          {asset.usedIn.length > 0 && (
            <div className="mt-1 text-[10px] text-muted-foreground truncate">
              用于: {asset.usedIn.join(', ')}
            </div>
          )}
        </div>
      </div>

      {/* 全屏预览 — 和立绘画廊一致 */}
      {preview && asset.url && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 cursor-zoom-out"
          onClick={() => setPreview(false)}>
          <img src={asset.url} alt={asset.name}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()} />
          <button onClick={() => setPreview(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* ESC 键关闭 */}
      {preview && <PreviewEsc onClose={() => setPreview(false)} />}
    </>
  )
}

function PreviewEsc({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return null
}
