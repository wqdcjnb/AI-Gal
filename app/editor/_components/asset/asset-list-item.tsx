'use client'

import { useState, useEffect } from 'react'
import { Download, X, Trash2, ImageIcon, Music2, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetItem } from '@/app/editor/_lib/types'

function formatDate(isoStr: string): string {
  const d = new Date(isoStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatFromUrl(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase() || ''
  return ext || '—'
}

function formatFileSize(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

export function AssetListItem({ asset, colors, onDelete, onRename, onPlay }: {
  asset: AssetItem
  colors: { bg: string; text: string; border: string; light: string; gradient: string }
  onDelete?: () => void
  onRename?: (name: string) => void
  onPlay?: (asset: AssetItem) => void
}) {
  const isImage = (asset.category === 'background' || asset.category === 'cg') && !!asset.url
  const isAudio = asset.category === 'bgm' || asset.category === 'se'
  const [preview, setPreview] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(asset.name)
  const [dimension, setDimension] = useState('—')

  useEffect(() => {
    if (!asset.url || isAudio) return
    const img = new window.Image()
    img.onload = () => setDimension(`${img.width}×${img.height}`)
    img.onerror = () => setDimension('—')
    img.src = asset.url
  }, [asset.url, isAudio])

  const saveName = () => {
    const name = editName.trim()
    if (name && name !== asset.name) onRename?.(name)
    else setEditName(asset.name)
    setEditing(false)
  }

  return (
    <>
      <div
        className={cn('group rounded-xl border border-border bg-card overflow-hidden hover:border-pink-200 hover:shadow-md transition-all', (isImage || isAudio) && 'cursor-pointer')}
        onClick={() => { if (isImage) setPreview(true); if (isAudio) onPlay?.(asset) }}
      >
        <div className="flex items-center gap-4 px-4 py-2.5">
          {/* Name + Tags */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <div className="min-w-0">
              {editing ? (
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={e => { if (e.key === 'Enter') saveName() }}
                  className="text-sm font-medium w-40 rounded border px-1 py-0.5 outline-none focus:border-pink-300"
                  autoFocus onClick={e => e.stopPropagation()} />
              ) : (
                <span className="text-sm font-medium text-foreground truncate cursor-pointer hover:text-pink-500"
                  onClick={e => { e.stopPropagation(); setEditing(true); setEditName(asset.name) }}>
                  {asset.name}
                </span>
              )}
            </div>
          </div>

          {/* Size */}
          <span className="text-xs text-muted-foreground font-mono w-20 text-right">
            {isAudio ? formatFileSize(asset.size) : dimension}
          </span>

          {/* Upload time */}
          <span className="text-xs text-muted-foreground w-24 text-right">{formatDate(asset.createdAt)}</span>

          {/* Format */}
          <span className="text-xs text-muted-foreground w-12 text-right">
            {formatFromUrl(asset.url)}
          </span>

          {/* Download */}
          <span className="w-8 flex justify-center">
            {asset.url && (
              <a href={asset.url} download={asset.name} onClick={e => e.stopPropagation()}
                className="text-muted-foreground hover:text-sky-500">
                <Download className="h-4 w-4" />
              </a>
            )}
          </span>

          {/* Delete */}
          <button onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500">
            <Trash2 className="h-3.5 w-3.5" />
          </button>

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
      </div>

      {/* 全屏预览 */}
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
