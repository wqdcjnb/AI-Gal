'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import type { Sprite } from '@/app/editor/_lib/types'

// ── Simple Select: search + pick, no add/delete ──
export function SimpleSelect({
  label, options, value, onChange,
}: {
  label: string; options: Sprite[]; value: string; onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = options.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const selectedName = options.find(s => s.id === value)?.name || ''

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {open ? (
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={selectedName || '搜索...'}
          className="w-full rounded-lg border border-pink-300 px-3 py-2 text-sm outline-none"
          autoFocus onKeyDown={e => e.stopPropagation()} />
      ) : (
        <button onClick={() => { setOpen(true); setSearch('') }}
          className="w-full rounded-lg border px-3 py-2 text-sm text-left hover:border-pink-300 transition-colors">
          <span className={selectedName ? 'text-foreground' : 'text-muted-foreground'}>{selectedName || '默认'}</span>
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg z-50 max-h-48 overflow-y-auto">
          <button onClick={() => { onChange(''); setOpen(false); setSearch('') }}
            className={`w-full text-left px-3 py-1.5 text-xs ${!value ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
            默认
          </button>
          {filtered.map(s => (
            <button key={s.id} onClick={() => { onChange(s.id); setOpen(false); setSearch('') }}
              className={`w-full text-left px-3 py-1.5 text-xs ${value === s.id ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
              {s.name}
            </button>
          ))}
          {filtered.length === 0 && search && <p className="px-3 py-2 text-[10px] text-muted-foreground">无匹配结果</p>}
        </div>
      )}
    </div>
  )
}

// ── Sprite Select: search + pick + add + delete ──
export function SpriteSelect({
  label, options, value, onChange, type, onAddSprite, onDeleteSprite,
}: {
  label: string; options: Sprite[]; value: string; onChange: (v: string) => void
  type: Sprite['type']
  onAddSprite: (type: Sprite['type'], name: string) => void
  onDeleteSprite: (spriteId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = options.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
  const selectedName = options.find(s => s.id === value)?.name || ''
  const exists = options.some(s => s.name === newName.trim())

  const handleAdd = () => {
    const name = newName.trim()
    if (!name || exists) return
    onAddSprite(type, name)
    setNewName('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      {open ? (
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={selectedName || '搜索...'}
          className="w-full rounded-lg border border-pink-300 px-3 py-2 text-sm outline-none"
          autoFocus onKeyDown={e => e.stopPropagation()} />
      ) : (
        <button onClick={() => { setOpen(true); setSearch('') }}
          className="w-full rounded-lg border px-3 py-2 text-sm text-left hover:border-pink-300 transition-colors">
          <span className={selectedName ? 'text-foreground' : 'text-muted-foreground'}>{selectedName || '默认'}</span>
        </button>
      )}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg z-50 max-h-56 flex flex-col">
          <div className="overflow-y-auto flex-1">
            <button onClick={() => { onChange(''); setOpen(false); setSearch('') }}
              className={`w-full text-left px-3 py-1.5 text-xs ${!value ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
              默认
            </button>
            {filtered.map(s => (
              <div key={s.id} className={`flex items-center ${value === s.id ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
                <button onClick={() => { onChange(s.id); setOpen(false); setSearch('') }}
                  className="flex-1 text-left px-3 py-1.5 text-xs">{s.name}</button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSprite(s.id); if (value === s.id) onChange('') }}
                  className="shrink-0 px-2 py-1.5 text-muted-foreground hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {filtered.length === 0 && search && <p className="px-3 py-2 text-[10px] text-muted-foreground">无匹配结果</p>}
          </div>
          <div className="border-t p-2 flex gap-1">
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="新选项名称" className="flex-1 rounded-md border px-2 py-1 text-xs outline-none focus:border-pink-300"
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }} />
            <button onClick={handleAdd} disabled={!newName.trim() || exists}
              className="shrink-0 rounded-md bg-pink-50 px-2 py-1 text-xs text-pink-600 hover:bg-pink-100 disabled:opacity-40">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
