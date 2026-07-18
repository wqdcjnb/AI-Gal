'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus } from 'lucide-react'

export function TagSection({
  label, tags, allTags, setTags, customTags, setCustomTags,
}: {
  label: string; tags: string[]; allTags: string[]; setTags: (v: string[]) => void
  customTags: string[]; setCustomTags: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [newTag, setNewTag] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    const tid = setTimeout(() => document.addEventListener('mousedown', h), 0)
    return () => { clearTimeout(tid); document.removeEventListener('mousedown', h) }
  }, [open])

  const availableTags = [...new Set([...allTags, ...customTags, ...tags])]

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t])
  }

  const addCustom = () => {
    const name = newTag.trim()
    if (!name || availableTags.includes(name)) return
    setCustomTags([...customTags, name])
    setTags([...tags, name])
    setNewTag('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
      <button type="button" onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="w-full rounded-lg border px-3 py-2 text-sm text-left hover:border-pink-300 transition-colors min-h-[38px]">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {tags.map(t => <span key={t} className="rounded-full bg-pink-100 text-pink-700 px-2 py-0.5 text-[11px]">{t}</span>)}
          </div>
        ) : <span className="text-muted-foreground">选择{label}...</span>}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border shadow-lg z-50 max-h-48 overflow-y-auto p-2 space-y-0.5">
          {availableTags.map(t => {
            const active = tags.includes(t)
            return (
              <div key={t} onMouseDown={(e) => { e.preventDefault(); toggleTag(t) }}
                className={`flex items-center gap-2 px-2 py-1 text-xs rounded cursor-pointer ${active ? 'bg-pink-50 text-pink-700' : 'hover:bg-muted'}`}>
                <span className={`h-3 w-3 rounded border ${active ? 'bg-pink-500 border-pink-500' : 'border-muted-foreground/30'}`} />
                {t}
              </div>
            )
          })}
          <div className="border-t pt-1.5 flex gap-1">
            <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)}
              placeholder="新选项" className="flex-1 rounded border px-2 py-0.5 text-[11px] outline-none"
              onKeyDown={e => { if (e.key === 'Enter') addCustom() }} />
            <button type="button" onMouseDown={(e) => { e.preventDefault(); addCustom() }}
              disabled={!newTag.trim() || availableTags.includes(newTag.trim())}
              className="rounded bg-pink-50 px-2 py-0.5 text-[11px] text-pink-600 disabled:opacity-30">
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
