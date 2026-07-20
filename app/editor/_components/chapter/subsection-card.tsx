'use client'

import { useState } from 'react'
import { MessageSquare, Quote, User, HelpCircle, Sparkles, Zap, X, Plus } from 'lucide-react'
const _defaultChars = [{ id: '', name: '未选择', color: '#888', sprites: [] }]
import type { SubSectionCardProps } from '@/app/editor/_lib/types'
import { DialogueCard } from '@/app/editor/_components/chapter/dialogue-card'
import { TriggerCard, TriggerPanel } from '@/app/editor/_components/chapter/trigger-card'
import type { Trigger } from '@/app/editor/_lib/types'

export function SubSectionCard({ subSection, index, isExpanded, onToggle, onUpdate, allSubSections = [], subSectionTree }: SubSectionCardProps) {
  const [showNewChoice, setShowNewChoice] = useState(false)
  const [showNewNarration, setShowNewNarration] = useState(false)
  const [showNewDialogue, setShowNewDialogue] = useState(false)
  const [showNewTrigger, setShowNewTrigger] = useState(false)
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  // Choices available for trigger conditions
  const choiceOptions = subSection.dialogues
    .filter(d => d.type === 'choice')
    .map(d => ({
      dialogueId: d.id,
      dialoguePrompt: d.content || '(无名称)',
      options: (d.choices || []).map((c, i) => ({ text: c.text, index: i })),
    }))

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
    if (dragIdx === null || dragIdx === dropIdx) return
    const dialogues = [...subSection.dialogues]
    const [moved] = dialogues.splice(dragIdx, 1)
    dialogues.splice(dropIdx, 0, moved)
    onUpdate?.({ ...subSection, dialogues })
    setDragIdx(null)
  }

  return (
    <>
    {showNewChoice && (
      <NewChoicePanel
        onSave={(prompt, choices) => {
          const newChoice = { id: `d-${Date.now()}`, type: 'choice' as const, content: prompt, choices }
          onUpdate?.({ ...subSection, dialogues: [...subSection.dialogues, newChoice] })
          setShowNewChoice(false)
        }}
        onClose={() => setShowNewChoice(false)}
      />
    )}
    {showNewNarration && (
      <NarrationPanel
        onSave={(content) => {
          const newNar = { id: `d-${Date.now()}`, type: 'narration' as const, content }
          onUpdate?.({ ...subSection, dialogues: [...subSection.dialogues, newNar] })
          setShowNewNarration(false)
        }}
        onClose={() => setShowNewNarration(false)}
      />
    )}
    {showNewDialogue && (
      <DialogueNewPanel
        onSave={(charId, charName, content) => {
          const newDialogue = { id: `d-${Date.now()}`, type: 'dialogue' as const, characterId: charId, characterName: charName, content }
          onUpdate?.({ ...subSection, dialogues: [...subSection.dialogues, newDialogue] })
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
          const triggers = subSection.triggers || []
          if (editingTrigger) {
            onUpdate?.({ ...subSection, triggers: triggers.map(tr => tr.id === t.id ? t : tr) })
          } else {
            onUpdate?.({ ...subSection, triggers: [...triggers, t] })
          }
          setShowNewTrigger(false)
          setEditingTrigger(null)
        }}
        onDelete={editingTrigger ? () => {
          onUpdate?.({ ...subSection, triggers: (subSection.triggers || []).filter(t => t.id !== editingTrigger.id) })
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
            {subSection.dialogues.length} 条对话
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-4">
          <div className="space-y-3">
            {subSection.dialogues.map((dialogue, dIndex) => (
              <DialogueCard key={dialogue.id} dialogue={dialogue} index={dIndex} subSectionIds={allSubSections}
                onUpdate={(updated) => {
                  onUpdate?.({ ...subSection, dialogues: subSection.dialogues.map(d => d.id === updated.id ? updated : d) })
                }}
                onDelete={() => {
                  onUpdate?.({ ...subSection, dialogues: subSection.dialogues.filter(d => d.id !== dialogue.id) })
                }}
                onDragStart={handleDragStart} onDragOver={handleDragOver} onDrop={handleDrop} />
            ))}
            {/* Trigger cards */}
            {(subSection.triggers || []).map((t) => (
              <TriggerCard key={t.id} trigger={t} onEdit={() => setEditingTrigger(t)} />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
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
function DialogueNewPanel({ onSave, onClose }: { onSave: (charId: string, charName: string, content: string) => void; onClose: () => void }) {
  const [charId, setCharId] = useState(_defaultChars[0]?.id || '')
  const [charName, setCharName] = useState(_defaultChars[0]?.name || '')
  const [content, setContent] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">新建角色对话</h3>
        <label className="text-[10px] text-muted-foreground mb-1 block">角色</label>
        <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          value={charId} onChange={e => { setCharId(e.target.value); setCharName(_defaultChars.find(c => c.id === e.target.value)?.name || '') }}>
          {_defaultChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="text-[10px] text-muted-foreground mb-1 block">对话内容</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入对话内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (content.trim()) { onSave(charId, charName, content); onClose() } }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Narration Panel ──
function NarrationPanel({ onSave, onClose, initialContent }: { onSave: (content: string) => void; onClose: () => void; initialContent?: string }) {
  const [content, setContent] = useState(initialContent || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-semibold text-foreground mb-3">{initialContent !== undefined ? '编辑旁白' : '新建旁白'}</h3>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入旁白内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (content.trim()) { onSave(content); onClose() } }}
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
          <button onClick={() => { onSave(prompt, choices.filter(c => c.text.trim())); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
