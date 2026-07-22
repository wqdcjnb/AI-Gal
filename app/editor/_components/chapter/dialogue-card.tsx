'use client'

import { useState, useEffect } from 'react'
import { Settings, HelpCircle, X, Plus, ChevronDown, Trash2, GripVertical, ImageIcon } from 'lucide-react'
import type { DialogueCardProps, Character } from '@/app/editor/_lib/types'
import { useProjectStore } from '@/lib/state/project-store-zustand'

function useCharacterOptions(): Character[] {
  const characters = useProjectStore(s => s.characters)
  return [
    { id: '', name: '未选择', color: '#888', sprites: [] },
    ...characters,
  ]
}
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

function useSeOptions() {
  const [options, setOptions] = useState<{ id: string; name: string }[]>([])
  useEffect(() => {
    const projectId = new URLSearchParams(window.location.search).get('id')
    if (!projectId) return
    fetch(`/api/assets?projectId=${projectId}&category=se`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) setOptions(json.data)
      }).catch(() => {})
  }, [])
  return options
}

const SettingsBlock = ({ show, children }: { show: boolean; children: React.ReactNode }) => {
  if (!show) return null
  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Settings className="h-3 w-3" />高级设置
      </div>
      {children}
    </div>
  )
}

export function DialogueCard({ dialogue, index, onUpdate, onDelete, subSectionIds = [], onDragStart, onDragOver, onDrop }: DialogueCardProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [choiceCollapsed, setChoiceCollapsed] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  const [narrationPanelOpen, setNarrationPanelOpen] = useState(false)
  const [dialoguePanelOpen, setDialoguePanelOpen] = useState(false)
  const [scenePanelOpen, setScenePanelOpen] = useState(false)
  const charOptions = useCharacterOptions()
  const seOptions = useSeOptions()
  const assetOptions = useAssetOptions()

  const hasSettings = dialogue.spriteExpression || dialogue.bgmChange || dialogue.soundEffect ||
    dialogue.cgTrigger

  // ── Scene ──
  if (dialogue.type === 'scene') {
    return (
      <>
        <div className="group rounded-lg border-2 border-dashed border-emerald-400/50 bg-emerald-50/20 p-3 hover:border-emerald-400 cursor-pointer"
          onClick={() => setScenePanelOpen(true)}
          draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
            <ImageIcon className="h-4 w-4 text-emerald-500" />
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">场景</span>
            <div className="flex-1" />
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {dialogue.backgroundChange && <span className="rounded bg-emerald-50 px-1.5 py-0.5">🖼️ {dialogue.backgroundChange}</span>}
            {dialogue.bgmChange && <span className="rounded bg-blue-50 px-1.5 py-0.5">🎵 {dialogue.bgmChange}</span>}
            {dialogue.cgTrigger && <span className="rounded bg-amber-50 px-1.5 py-0.5">🎬 {dialogue.cgTrigger}</span>}
          </div>
        </div>
        {scenePanelOpen && (
          <SceneEditPanel dialogue={dialogue} onUpdate={onUpdate} onDelete={onDelete} onClose={() => setScenePanelOpen(false)}
            bgOptions={assetOptions.bg} bgmOptions={assetOptions.bgm} cgOptions={assetOptions.cg} />
        )}
      </>
    )
  }

  // ── Narration ──
  if (dialogue.type === 'narration') {
    return (
      <>
        <div className="group rounded-lg border border-border bg-muted/30 p-3 hover:border-pink-200 cursor-pointer"
          onClick={() => setNarrationPanelOpen(true)}
          draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{dialogue.characterName || '旁白'}</span>
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
            <IndicatorBadges dialogue={dialogue} />
            <div className="flex-1" />
            <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
              className={`rounded p-1 text-xs transition-colors ${hasSettings ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}>
              <Settings className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm italic text-muted-foreground line-clamp-2">{dialogue.content}</p>
        </div>
        <SettingsBlock show={showSettings}>
          <PerfSettings dialogue={dialogue} onUpdate={onUpdate} seOptions={seOptions} />
        </SettingsBlock>
        {narrationPanelOpen && (
          <NarrationEditPanel
            dialogue={dialogue}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={() => setNarrationPanelOpen(false)}
          />
        )}
      </>
    )
  }

  // ── Choice ──
  if (dialogue.type === 'choice') {
    const choices = dialogue.choices || []

    return (
      <>
        <div className="group rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-3 hover:border-amber-400"
          onClick={() => setPanelOpen(true)}
          draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
            <HelpCircle className="h-4 w-4 text-amber-600" />
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{dialogue.content || '选择'}</span>
            <span className="text-xs text-muted-foreground">#{index + 1}</span>
            <span className="text-xs text-muted-foreground">({choices.length} 个选项)</span>
            <div className="flex-1" />
            <button onClick={(e) => { e.stopPropagation(); setChoiceCollapsed(!choiceCollapsed) }}
              className={`p-0.5 transition-transform ${choiceCollapsed ? '-rotate-90' : ''}`}>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
          {!choiceCollapsed && choices.length > 0 && (
            <div className="mt-2 space-y-1">
              {choices.map((c, i) => (
                <div key={i} className="text-xs text-muted-foreground pl-6">{i + 1}. {c.text || '(空)'}</div>
              ))}
            </div>
          )}
        </div>

        {panelOpen && <ChoicePanel dialogue={dialogue} onUpdate={onUpdate} onDelete={onDelete} onClose={() => setPanelOpen(false)} />}
      </>
    )
  }

  // ── Character Dialogue ──
  const char = charOptions.find(c => c.id === dialogue.characterId)
  const savedCombos = useProjectStore(s => s.savedCombos)
  const charCombos = (savedCombos[dialogue.characterId || ''] || []) as { id: string; name: string; url?: string }[]

  return (
    <>
      <div className="group rounded-lg border border-border bg-card p-3 hover:border-pink-200 cursor-pointer"
        onClick={() => setDialoguePanelOpen(true)}
        draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
        <div className="flex items-center gap-2 mb-2">
          <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
          {char && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium overflow-hidden" style={{ backgroundColor: char.color }}>
              {char.avatar ? <img src={char.avatar} alt="" className="h-full w-full object-cover" /> : char.name[0]}
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: char?.color || dialogue.characterColor || '#666' }}>{dialogue.characterName || char?.name || '未知角色'}</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
          <IndicatorBadges dialogue={dialogue} />
          <div className="flex-1" />
          <button onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
            className={`rounded p-1 text-xs transition-colors ${hasSettings ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}>
            <Settings className="h-3 w-3" />
          </button>
        </div>
        <p className="text-sm text-foreground">{dialogue.content}</p>
      </div>
      <SettingsBlock show={showSettings}>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">🎭 立绘</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.spriteId || ''}
              onChange={(e) => onUpdate?.({ ...dialogue, spriteId: e.target.value || undefined })}>
              <option value="">无</option>
              {charCombos.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">📍 立绘位置</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs"
              value={dialogue.spritePosition || 'center'}
              onChange={(e) => onUpdate?.({ ...dialogue, spritePosition: e.target.value as any || undefined })}>
              <option value="left">左</option><option value="center">中</option><option value="right">右</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">🔊 音效</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.soundEffect || ''}
              onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value || undefined })}>
              <option value="">无</option>
              {seOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </SettingsBlock>
      {dialoguePanelOpen && (
        <DialogueEditPanel dialogue={dialogue} onUpdate={onUpdate} onDelete={onDelete} onClose={() => setDialoguePanelOpen(false)} />
      )}
    </>
  )
}

// ── Delete Confirm ──
function DeleteConfirmButton({ onDelete }: { onDelete: () => void }) {
  const [show, setShow] = useState(false)
  return (
    <>
      <button onClick={() => setShow(true)}
        className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
        <Trash2 className="h-4 w-4" />
      </button>
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShow(false)}>
          <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-foreground">确认删除</h3>
            <p className="mt-1 text-xs text-muted-foreground">确定要删除这个选择吗？</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShow(false)} className="flex-1 rounded-lg border border-border py-1.5 text-xs">取消</button>
              <button onClick={() => { onDelete(); setShow(false) }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white font-medium">删除</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Narration Edit Panel ──
function NarrationEditPanel({ dialogue, onUpdate, onClose, onDelete }: { dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void }) {
  const [label, setLabel] = useState(dialogue.characterName || '旁白')
  const [content, setContent] = useState(dialogue.content || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">编辑旁白</h3>
          <DeleteConfirmButton onDelete={() => { onDelete?.(); onClose() }} />
        </div>
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
          <button onClick={() => { if (!content.trim()) return; onUpdate?.({ ...dialogue, characterName: label || '旁白', content }); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Dialogue Edit Panel ──
function DialogueEditPanel({ dialogue, onUpdate, onClose, onDelete }: { dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void }) {
  const charOptions = useCharacterOptions()
  const char = charOptions.find(c => c.id === dialogue.characterId)
  const [charId, setCharId] = useState(dialogue.characterId || charOptions[0]?.id || '')
  const [charName, setCharName] = useState(dialogue.characterName || char?.name || '')
  const [charColor, setCharColor] = useState(dialogue.characterColor || char?.color || '#888')
  const [content, setContent] = useState(dialogue.content || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">编辑角色对话</h3>
          <DeleteConfirmButton onDelete={() => { onDelete?.(); onClose() }} />
        </div>
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
          <button onClick={() => { if (!content.trim() || !charId) return; onUpdate?.({ ...dialogue, characterId: charId, characterName: charName, characterColor: charColor, content }); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim() || !charId}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Choice Panel (modal) ──
function ChoicePanel({ dialogue, onUpdate, onClose, onDelete }: { dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void }) {
  const [prompt, setPrompt] = useState(dialogue.content || '')
  const [choices, setChoices] = useState((dialogue.choices || []).map((c: any) => ({ text: c.text || '' })))

  const validChoices = choices.filter((c: any) => c.text.trim())
  const canSave = prompt.trim() && validChoices.length > 0

  const save = () => {
    if (!canSave) return
    onUpdate?.({ ...dialogue, content: prompt.trim(), choices: validChoices })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">编辑选择</h3>
          <DeleteConfirmButton onDelete={() => { onDelete?.(); onClose() }} />
        </div>

        {/* Prompt */}
        <label className="text-[10px] text-muted-foreground mb-1 block">名称</label>
        <input type="text" value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          placeholder="例如：接下来要做什么？" />

        {/* Options */}
        <label className="text-[10px] text-muted-foreground mb-1 block">选项 ({choices.length})</label>
        <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
          {choices.map((c: any, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-5">{i + 1}.</span>
              <input type="text" value={c.text}
                onChange={e => {
                  const nc = [...choices]
                  nc[i] = { text: e.target.value }
                  setChoices(nc)
                }}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                placeholder={`选项 ${i + 1}`} />
              <button onClick={() => setChoices(choices.filter((_: any, j: number) => j !== i))}
                className="text-muted-foreground hover:text-red-400"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <button onClick={() => setChoices([...choices, { text: '' }])}
          className="w-full rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:border-amber-300 hover:text-amber-600 transition-colors mb-4">
          + 添加选项
        </button>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={save} disabled={!canSave} className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Indicator badges ──
function IndicatorBadges({ dialogue }: { dialogue: DialogueCardProps['dialogue'] }) {
  return (
    <div className="flex items-center gap-1">
      {dialogue.soundEffect && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600">🔊</span>}
    </div>
  )
}

// ── Performance settings ──
function PerfSettings({ dialogue, onUpdate, seOptions }: { dialogue: any; onUpdate?: any; seOptions: { id: string; name: string }[] }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">🔊 音效</label>
      <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.soundEffect || ''}
        onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value || undefined })}>
        <option value="">无</option>
        {seOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
      </select>
    </div>
  )
}

// ── Scene Edit Panel ──
function SceneEditPanel({ dialogue, onUpdate, onClose, onDelete, bgOptions, bgmOptions, cgOptions }: {
  dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void
  bgOptions: { id: string; name: string }[]
  bgmOptions: { id: string; name: string }[]
  cgOptions: { id: string; name: string }[]
}) {
  const [bg, setBg] = useState(dialogue.backgroundChange || '')
  const [bgm, setBgm] = useState(dialogue.bgmChange || '')
  const [cg, setCg] = useState(dialogue.cgTrigger || '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">编辑场景</h3>
          <DeleteConfirmButton onDelete={() => { onDelete?.(); onClose() }} />
        </div>
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
          <button onClick={() => { onUpdate?.({ ...dialogue, backgroundChange: bg || undefined, bgmChange: bgm || undefined, cgTrigger: cg || undefined }); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}

