'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import type { Character, SavedCombo } from '@/app/editor/_lib/types'

function ImageSize({ url }: { url: string }) {
  const [size, setSize] = useState('')
  useEffect(() => {
    if (!url.startsWith('data:')) return
    const img = new window.Image()
    img.onload = () => setSize(`${img.width}×${img.height}`)
    img.src = url
  }, [url])
  return <span>{size || '...'}</span>
}

export function ComboCard({
  combo, selectedChar, onEdit, onDelete, onRename, spriteName,
}: {
  combo: SavedCombo
  selectedChar: Character
  onEdit: () => void
  onDelete: () => void
  onRename: (name: string) => void
  spriteName: (id?: string) => string
}) {
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(combo.name)

  const saveName = () => {
    const name = editName.trim()
    if (name && name !== combo.name) onRename(name)
    setEditing(false)
  }

  return (
    <div className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-[3/4] bg-gradient-to-b from-pink-50 to-violet-50 flex items-center justify-center relative overflow-hidden"
        onClick={onEdit}>
        {combo.url ? (
          <>
            <img src={combo.url} alt={combo.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageSize url={combo.url} />
            </div>
            <a href={combo.url} download={combo.name} onClick={e => e.stopPropagation()}
              className="absolute bottom-1 right-1 rounded bg-sky-500 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-sky-600">
              <Download className="h-3 w-3" />
            </a>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white text-4xl font-bold group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: selectedChar.color }}>
            {selectedChar.name[0]}
          </div>
        )}
        <button onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <X className="h-3 w-3" />
        </button>
      </div>
      <div className="p-2">
        {editing ? (
          <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
            onBlur={saveName} onKeyDown={e => { if (e.key === 'Enter') saveName() }}
            className="text-xs font-medium w-full rounded border px-1 py-0.5 outline-none focus:border-pink-300"
            autoFocus onClick={e => e.stopPropagation()} />
        ) : (
          <p className="text-xs font-medium truncate cursor-pointer hover:text-pink-500"
            onClick={e => { e.stopPropagation(); setEditing(true); setEditName(combo.name) }}>
            {combo.name}
          </p>
        )}
        <div className="flex flex-wrap gap-0.5 mt-1">
          {spriteName(combo.expressionId) && <span className="rounded bg-violet-50 px-1 py-0.5 text-[10px] text-violet-600">{spriteName(combo.expressionId)}</span>}
          {spriteName(combo.outfitId) && <span className="rounded bg-green-50 px-1 py-0.5 text-[10px] text-green-600">{spriteName(combo.outfitId)}</span>}
          {spriteName(combo.poseId) && <span className="rounded bg-purple-50 px-1 py-0.5 text-[10px] text-purple-600">{spriteName(combo.poseId)}</span>}
        </div>
      </div>
    </div>
  )
}
