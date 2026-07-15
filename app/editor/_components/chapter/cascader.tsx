'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'

type Option = { value: string; label: string; children?: Option[] }

export function Cascader({ options, value, onChange, placeholder }: {
  options: Option[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [level1, setLevel1] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectedOption = findOption(options, value)
  const displayText = selectedOption ? getPath(options, value).join(' / ') : ''

  const l1Options = options
  const l2Options = level1 ? options.find(o => o.value === level1)?.children || [] : []

  const selectL1 = (v: string) => {
    const opt = options.find(o => o.value === v)
    if (opt?.children?.length) {
      setLevel1(v)
    } else {
      onChange(v)
      setOpen(false)
      setLevel1(null)
    }
  }

  const selectL2 = (v: string) => {
    onChange(v)
    setOpen(false)
    setLevel1(null)
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-left flex items-center gap-2">
        <span className={displayText ? 'text-foreground' : 'text-muted-foreground'}>
          {displayText || placeholder || '请选择'}
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-border shadow-lg z-50 flex">
          {/* Level 1 */}
          <div className="flex-1 max-h-48 overflow-y-auto border-r border-border">
            {l1Options.map(o => (
              <button key={o.value}
                onClick={() => selectL1(o.value)}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${level1 === o.value ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
                {o.label}
                {o.children?.length ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : null}
              </button>
            ))}
          </div>
          {/* Level 2 */}
          {l2Options.length > 0 && (
            <div className="flex-1 max-h-48 overflow-y-auto">
              {l2Options.map(o => (
                <button key={o.value}
                  onClick={() => selectL2(o.value)}
                  className={`w-full text-left px-3 py-1.5 text-xs ${value === o.value ? 'bg-pink-50 text-pink-600' : 'hover:bg-muted'}`}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function findOption(opts: Option[], value?: string): Option | null {
  if (!value) return null
  for (const o of opts) {
    if (o.value === value) return o
    if (o.children) { const found = findOption(o.children, value); if (found) return found }
  }
  return null
}

function getPath(opts: Option[], value?: string): string[] {
  if (!value) return []
  for (const o of opts) {
    if (o.value === value) return [o.label]
    if (o.children) { const child = getPath(o.children, value); if (child.length) return [o.label, ...child] }
  }
  return []
}
