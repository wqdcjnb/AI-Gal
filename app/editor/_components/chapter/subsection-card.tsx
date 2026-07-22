'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Quote, User, HelpCircle, Sparkles, Zap, X, Plus, ImageIcon } from 'lucide-react'
import type { SubSectionCardProps, DialogueLine } from '@/app/editor/_lib/types'
import { DialogueCard } from '@/app/editor/_components/chapter/dialogue-card'
import { TriggerCard, TriggerPanel } from '@/app/editor/_components/chapter/trigger-card'
import type { Trigger } from '@/app/editor/_lib/types'
import { useProjectStore } from '@/lib/state/project-store-zustand'

// 预加载素材选项（缓存，只请求一次）
let cachedAssetOptions: { bg: { id: string; name: string }[]; bgm: { id: string; name: string }[]; cg: { id: string; name: string }[] } | null = null

function useAssetOptions() {
  const [opts, setOpts] = useState(cachedAssetOptions || { bg: [], bgm: [], cg: [] })
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('id')
    if (!projectId) return
    fetch(`/api/assets?projectId=${projectId}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          const result = {
            bg: json.data.filter((a: any) => a.category === 'background'),
            bgm: json.data.filter((a: any) => a.category === 'bgm'),
            cg: json.data.filter((a: any) => a.category === 'cg'),
          }
          cachedAssetOptions = result
          setOpts(result)
        }
      }).catch(() => {})
  }, [])
  return opts
}

function useCharacterOptions() {
  const characters = useProjectStore(s => s.characters)
  return [
    { id: '', name: '未选择', color: '#888', sprites: [] },
    ...characters,
  ]
}

export function SubSectionCard({ subSection, index, isExpanded, onToggle, onUpdate, allSubSections = [], subSectionTree }: SubSectionCardProps) {
  const [showNewChoice, setShowNewChoice] = useState(false)
  const [showNewNarration, setShowNewNarration] = useState(false)
  const [showNewDialogue, setShowNewDialogue] = useState(false)
  const [showNewTrigger, setShowNewTrigger] = useState(false)
  const [showNewScene, setShowNewScene] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const assetOptions = useAssetOptions()

  // ═══════════════════════════════════════════════
  // Unified timeline — all items in one flat list
  // ═══════════════════════════════════════════════
  type TimelineItem =
    | { kind: 'dialogue'; data: DialogueLine }
    | { kind: 'trigger'; data: Trigger }

  const buildTimeline = (d: DialogueLine[], t: Trigger[]): TimelineItem[] => [
    ...d.map(dd => ({ kind: 'dialogue' as const, data: dd })),
    ...t.map(tt => ({ kind: 'trigger' as const, data: tt })),
  ]

  const [timeline, setTimeline] = useState<TimelineItem[]>(() =>
    buildTimeline(subSection.dialogues, subSection.triggers || [])
  )

  // Detect external changes (API load / navigation) vs internal updates
  const isInternal = useRef(false)
  const propsFingerprint = useMemo(() => {
    const dIds = subSection.dialogues.map(d => d.id).sort().join(',')
    const tIds = (subSection.triggers || []).map(t => t.id).sort().join(',')
    return `${dIds}|${tIds}`
  }, [subSection.dialogues, subSection.triggers])

  const prevFingerprint = useRef(propsFingerprint)

  useEffect(() => {
    if (isInternal.current) {
      isInternal.current = false
      prevFingerprint.current = propsFingerprint
      return
    }
    if (prevFingerprint.current !== propsFingerprint) {
      prevFingerprint.current = propsFingerprint
      setTimeline(buildTimeline(subSection.dialogues, subSection.triggers || []))
    }
  }, [propsFingerprint, subSection.dialogues, subSection.triggers])

  // Reset on subsection change
  const prevSubId = useRef(subSection.id)
  useEffect(() => {
    if (prevSubId.current !== subSection.id) {
      prevSubId.current = subSection.id
      isInternal.current = false
      setTimeline(buildTimeline(subSection.dialogues, subSection.triggers || []))
    }
  }, [subSection.id, subSection.dialogues, subSection.triggers])

  const splitTimeline = (tl: TimelineItem[]) => {
    const newDialogues: DialogueLine[] = []
    const newTriggers: Trigger[] = []
    for (const item of tl) {
      if (item.kind === 'dialogue') newDialogues.push(item.data)
      else newTriggers.push(item.data)
    }
    return { dialogues: newDialogues, triggers: newTriggers }
  }

  const persist = (tl: TimelineItem[]) => {
    isInternal.current = true
    const { dialogues: newDialogues, triggers: newTriggers } = splitTimeline(tl)
    onUpdate?.({ ...subSection, dialogues: newDialogues, triggers: newTriggers })
  }

  const choiceOptions = subSection.dialogues
    .filter(d => d.type === 'choice')
    .map(d => ({
      dialogueId: d.id,
      dialoguePrompt: d.content || '(无名称)',
      options: (d.choices || []).map((c, i) => ({ text: c.text, index: i })),
    }))

  // ── Drag handlers ──
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === dropIdx || dragIdx >= timeline.length) return
    const next = [...timeline]
    const [moved] = next.splice(dragIdx, 1)
    if (moved) {
      next.splice(dropIdx, 0, moved)
      setTimeline(next)
      persist(next)
    }
    setDragIdx(null)
  }

  // ── CRUD helpers ──
  const appendItem = (item: TimelineItem) => {
    const next = [...timeline, item]
    setTimeline(next)
    persist(next)
  }

  const removeItem = (idx: number) => {
    const next = timeline.filter((_, i) => i !== idx)
    setTimeline(next)
    persist(next)
  }

  const updateDialogue = (id: string, updated: DialogueLine) => {
    const next = timeline.map(item =>
      item.kind === 'dialogue' && item.data.id === id
        ? { kind: 'dialogue' as const, data: updated }
        : item
    )
    setTimeline(next)
    persist(next)
  }

  return (
    <>
    {showNewChoice && (
      <NewChoicePanel
        onSave={(prompt, choices) => {
          appendItem({ kind: 'dialogue', data: { id: `d-${Date.now()}`, type: 'choice', content: prompt, choices } })
          setShowNewChoice(false)
        }}
        onClose={() => setShowNewChoice(false)}
      />
    )}
    {showNewScene && (
      <SceneNewPanel
        bgOptions={assetOptions.bg} bgmOptions={assetOptions.bgm} cgOptions={assetOptions.cg}
        onSave={(bg, bgm, cg) => {
          appendItem({ kind: 'dialogue', data: { id: `d-${Date.now()}`, type: 'scene', backgroundChange: bg || undefined, bgmChange: bgm || undefined, cgTrigger: cg || undefined, content: '' } })
          setShowNewScene(false)
        }}
        onClose={() => setShowNewScene(false)}
      />
    )}
    {showNewNarration && (
      <NarrationPanel
        onSave={(label, content) => {
          appendItem({ kind: 'dialogue', data: { id: `d-${Date.now()}`, type: 'narration', characterName: label, content } })
          setShowNewNarration(false)
        }}
        onClose={() => setShowNewNarration(false)}
      />
    )}
    {showNewDialogue && (
      <DialogueNewPanel
        onSave={(charId, charName, charColor, content) => {
          appendItem({ kind: 'dialogue', data: { id: `d-${Date.now()}`, type: 'dialogue', characterId: charId, characterName: charName, characterColor: charColor, content } })
          setShowNewDialogue(false)
        }}
        onClose={() => setShowNewDialogue(false)}
      />
    )}
    {(showNewTrigger || editingTrigger) && (
      <TriggerPanel
        trigger={editingTrigger || undefined}
        choiceOptions={choiceOptions}
        subSectionIds={subSectionTree || allSubSections.map(s => ({ value: s.id, label: s.title }))}
        onSave={(t) => {
          if (editingTrigger) {
            // Edit in place
            const next = timeline.map(item =>
              item.kind === 'trigger' && item.data.id === editingTrigger.id
                ? { kind: 'trigger' as const, data: t }
                : item
            )
            setTimeline(next)
            persist(next)
          } else {
            appendItem({ kind: 'trigger', data: t })
          }
          setShowNewTrigger(false)
          setEditingTrigger(null)
        }}
        onDelete={editingTrigger ? () => {
          const idx = timeline.findIndex(i => i.kind === 'trigger' && i.data.id === editingTrigger.id)
          if (idx !== -1) removeItem(idx)
        } : undefined}
        onClose={() => { setShowNewTrigger(false); setEditingTrigger(null) }}
      />
    )}
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow border-border">
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={onToggle}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold bg-gradient-to-br from-pink-100 to-violet-100 text-pink-600">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{subSection.title}</h4>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {timeline.length} 条内容
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-4">
          <div className="space-y-3">
            {timeline.map((item, ti) => {
              if (item.kind === 'trigger') {
                return (
                  <TriggerCard key={item.data.id} trigger={item.data} onEdit={() => setEditingTrigger(item.data)} subSectionTree={subSectionTree}
                    onDragStart={(e) => handleDragStart(e, ti)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, ti)}
                  />
                )
              }
              const dialogue = item.data
              const displayIndex = timeline.slice(0, ti).filter(i => i.kind === 'dialogue' && i.data.type !== 'scene').length
              return <DialogueCard key={dialogue.id} dialogue={dialogue} index={displayIndex} subSectionIds={allSubSections}
                onUpdate={(updated) => updateDialogue(dialogue.id, updated)}
                onDelete={() => removeItem(ti)}
                onDragStart={(e) => handleDragStart(e, ti)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, ti)}
              />
            })}
          </div>

          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
            <button onClick={() => setShowNewScene(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <ImageIcon className="h-4 w-4" />场景
            </button>
            <button onClick={() => setShowNewNarration(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <Quote className="h-4 w-4" />旁白
            </button>
            <button onClick={() => setShowNewDialogue(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <User className="h-4 w-4" />角色对话
            </button>
            <button onClick={() => setShowNewChoice(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <HelpCircle className="h-4 w-4" />选择
            </button>
            <button onClick={() => setShowNewTrigger(true)}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <Zap className="h-4 w-4" />触发器
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all">
              <Sparkles className="h-4 w-4" />AI 生成
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// ── Dialogue New Panel ──
function DialogueNewPanel({ onSave, onClose }: { onSave: (charId: string, charName: string, charColor: string, content: string) => void; onClose: () => void }) {
  const charOptions = useCharacterOptions()
  const [charId, setCharId] = useState(charOptions[0]?.id || '')
  const [charName, setCharName] = useState(charOptions[0]?.name || '')
  const [charColor, setCharColor] = useState(charOptions[0]?.color || '#888')
  const [content, setContent] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">新建角色对话</h3>
        <label className="text-[10px] text-muted-foreground mb-1 block">角色</label>
        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          value={charId} onChange={e => {
            const selected = charOptions.find(c => c.id === e.target.value)
            setCharId(e.target.value)
            setCharName(selected?.name || '')
            setCharColor(selected?.color || '#888')
          }}>
          {charOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="text-[10px] text-muted-foreground mb-1 block">对话内容</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入对话内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (content.trim() && charId) { onSave(charId, charName, charColor, content); onClose() } }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim() || !charId}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Narration Panel ──
function NarrationPanel({ onSave, onClose, initialContent, initialLabel }: { onSave: (label: string, content: string) => void; onClose: () => void; initialContent?: string; initialLabel?: string }) {
  const [label, setLabel] = useState(initialLabel || '旁白')
  const [content, setContent] = useState(initialContent || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">{initialContent !== undefined ? '编辑旁白' : '新建旁白'}</h3>
        <label className="text-[10px] text-muted-foreground mb-1 block">标签</label>
        <input type="text" value={label} onChange={e => setLabel(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          placeholder="旁白" />
        <label className="text-[10px] text-muted-foreground mb-1 block">内容</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入旁白内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (content.trim()) { onSave(label || '旁白', content); onClose() } }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── New Choice Panel ──
function NewChoicePanel({ onSave, onClose }: { onSave: (prompt: string, choices: { text: string }[]) => void; onClose: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [choices, setChoices] = useState<{ text: string }[]>([{ text: '' }, { text: '' }])

  const validChoices = choices.filter(c => c.text.trim())
  const canSave = prompt.trim() && validChoices.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">新建选择</h3>
        <label className="text-[10px] text-muted-foreground mb-1 block">名称</label>
        <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          placeholder="例如：接下来要做什么？" />
        <label className="text-[10px] text-muted-foreground mb-1 block">选项 ({choices.length})</label>
        <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
          {choices.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-5">{i + 1}.</span>
              <input type="text" value={c.text} onChange={e => {
                const nc = [...choices]; nc[i] = { text: e.target.value }; setChoices(nc)
              }}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                placeholder={`选项 ${i + 1}`} />
              <button onClick={() => setChoices(choices.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => setChoices([...choices, { text: '' }])}
          className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-amber-300 hover:text-amber-600 mb-4">
          <Plus className="h-3 w-3 inline mr-1" />添加选项
        </button>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (!canSave) return; onSave(prompt.trim(), validChoices); onClose() }}
            disabled={!canSave}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Scene New Panel ──
function SceneNewPanel({ onSave, onClose, bgOptions, bgmOptions, cgOptions }: {
  onSave: (bg: string, bgm: string, cg: string) => void
  onClose: () => void
  bgOptions: { id: string; name: string }[]
  bgmOptions: { id: string; name: string }[]
  cgOptions: { id: string; name: string }[]
}) {
  const [bg, setBg] = useState('')
  const [bgm, setBgm] = useState('')
  const [cg, setCg] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">新建场景</h3>
        <label className="text-[10px] text-muted-foreground mb-1 block">🖼️ 背景</label>
        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3" value={bg} onChange={e => setBg(e.target.value)}>
          <option value="">无</option>
          {bgOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
        </select>
        <label className="text-[10px] text-muted-foreground mb-1 block">🎵 BGM</label>
        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3" value={bgm} onChange={e => setBgm(e.target.value)}>
          <option value="">无</option>
          {bgmOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
        </select>
        <label className="text-[10px] text-muted-foreground mb-1 block">🎬 CG</label>
        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-4" value={cg} onChange={e => setCg(e.target.value)}>
          <option value="">无</option>
          {cgOptions.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
        </select>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { onSave(bg, bgm, cg); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
