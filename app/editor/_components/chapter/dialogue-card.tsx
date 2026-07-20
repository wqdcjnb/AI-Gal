'use client'

import { useState } from 'react'
import { Settings, HelpCircle, Mic, X, Plus, ChevronDown, Trash2, GripVertical } from 'lucide-react'
import type { DialogueCardProps } from '@/app/editor/_lib/types'

const _defaultChars = [{ id: '', name: '未选择', color: '#888', sprites: [] }]
const bgmOptions: any[] = []
const seOptions: any[] = []
const cgOptions: any[] = []
const voiceOptions: any[] = []
const bgOptions: any[] = []

const voiceEmotions = ['默认', '开心', '悲伤', '愤怒', '惊讶', '害羞', '紧张', '温柔', '冷淡']

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

  const hasSettings = dialogue.spriteExpression || dialogue.bgmChange || dialogue.soundEffect ||
    dialogue.cgTrigger || (dialogue.screenEffect && dialogue.screenEffect !== 'none') ||
    dialogue.voiceId || dialogue.voiceEmotion

  // ── Narration ──
  if (dialogue.type === 'narration') {
    return (
      <>
        <div className="group rounded-lg border border-border bg-muted/30 p-3 hover:border-pink-200 cursor-pointer"
          onClick={() => setNarrationPanelOpen(true)}
          draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
          <div className="flex items-center gap-2 mb-2">
            <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">旁白</span>
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
          <PerfSettings dialogue={dialogue} onUpdate={onUpdate} />
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
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">选择</span>
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
  const char = _defaultChars.find(c => c.id === dialogue.characterId)
  const charSprites = char?.sprites || []

  return (
    <>
      <div className="group rounded-lg border border-border bg-card p-3 hover:border-pink-200 cursor-pointer"
        onClick={() => setDialoguePanelOpen(true)}
        draggable onDragStart={(e) => onDragStart?.(e, index)} onDragOver={onDragOver} onDrop={(e) => onDrop?.(e, index)}>
        <div className="flex items-center gap-2 mb-2">
          <span className="cursor-grab text-muted-foreground/30 hover:text-muted-foreground" onClick={e => e.stopPropagation()}><GripVertical className="h-4 w-4" /></span>
          {char && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium" style={{ backgroundColor: char.color }}>
              {char.name[0]}
            </div>
          )}
          <span className="text-sm font-medium" style={{ color: dialogue.characterColor || char?.color || '#666' }}>{dialogue.characterName || '未知角色'}</span>
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">🎭 立绘</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.spriteId || ''}
              onChange={(e) => onUpdate?.({ ...dialogue, spriteId: e.target.value || undefined })}>
              <option value="">默认</option>
              {charSprites.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type === 'base' ? '基础' : s.type === 'expression' ? '表情' : s.type === 'outfit' ? '服装' : '动作'})</option>)}
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
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1"><Mic className="h-3 w-3" />角色语音</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.voiceId || ''}
              onChange={(e) => onUpdate?.({ ...dialogue, voiceId: e.target.value || undefined })}>
              <option value="">无</option>
              {voiceOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">🎙️ 语音情绪</label>
            <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.voiceEmotion || '默认'}
              onChange={(e) => onUpdate?.({ ...dialogue, voiceEmotion: e.target.value })}>
              {voiceEmotions.map(ve => <option key={ve} value={ve}>{ve}</option>)}
            </select>
          </div>
        </div>
        <PerfSettings dialogue={dialogue} onUpdate={onUpdate} />
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
  const [content, setContent] = useState(dialogue.content || '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">编辑旁白</h3>
          <DeleteConfirmButton onDelete={() => { onDelete?.(); onClose() }} />
        </div>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入旁白内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (!content.trim()) return; onUpdate?.({ ...dialogue, content }); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Dialogue Edit Panel ──
function DialogueEditPanel({ dialogue, onUpdate, onClose, onDelete }: { dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void }) {
  const char = _defaultChars.find(c => c.id === dialogue.characterId)
  const [charId, setCharId] = useState(dialogue.characterId || _defaultChars[0]?.id || '')
  const [charName, setCharName] = useState(dialogue.characterName || char?.name || '')
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
          value={charId} onChange={e => { setCharId(e.target.value); setCharName(_defaultChars.find(c => c.id === e.target.value)?.name || '') }}>
          {_defaultChars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="text-[10px] text-muted-foreground mb-1 block">对话内容</label>
        <textarea value={content} onChange={e => setContent(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none mb-4 h-32"
          placeholder="输入对话内容..." />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => { if (!content.trim()) return; onUpdate?.({ ...dialogue, characterId: charId, characterName: charName, content }); onClose() }}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50" disabled={!content.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Choice Panel (modal) ──
function ChoicePanel({ dialogue, onUpdate, onClose, onDelete }: { dialogue: any; onUpdate?: any; onClose: () => void; onDelete?: () => void }) {
  const [prompt, setPrompt] = useState(dialogue.content || '')
  const [choices, setChoices] = useState((dialogue.choices || []).map((c: any) => ({ text: c.text || '' })))

  const save = () => {
    onUpdate?.({ ...dialogue, content: prompt, choices })
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
          <button onClick={save} disabled={!prompt.trim()} className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  )
}

// ── Indicator badges ──
function IndicatorBadges({ dialogue }: { dialogue: DialogueCardProps['dialogue'] }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="flex items-center gap-1">
      {dialogue.backgroundChange && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-600">🖼️</span>}
      {dialogue.bgmChange && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">🎵</span>}
      {dialogue.soundEffect && <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600">🔊</span>}
      {dialogue.cgTrigger && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600">🎬</span>}
      {dialogue.screenEffect && dialogue.screenEffect !== 'none' && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">⚡</span>}
      {dialogue.voiceId && (
        <span onClick={(e) => { e.stopPropagation(); setPlaying(!playing) }}
          className={`rounded px-1.5 py-0.5 text-[10px] cursor-pointer transition-colors ${playing ? 'bg-cyan-200 text-cyan-800' : 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200'}`}>
          {playing ? '🔊' : '🎙️'}
        </span>
      )}
    </div>
  )
}

// ── Performance settings ──
function PerfSettings({ dialogue, onUpdate }: { dialogue: any; onUpdate?: any }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">🖼️ 背景</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.backgroundChange || ''}
            onChange={(e) => onUpdate?.({ ...dialogue, backgroundChange: e.target.value || undefined })}>
            {bgOptions.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">🎵 BGM</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.bgmChange || ''}
            onChange={(e) => onUpdate?.({ ...dialogue, bgmChange: e.target.value || undefined })}>
            {bgmOptions.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">🔊 音效</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.soundEffect || ''}
            onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value || undefined })}>
            <option value="">无</option>
            {seOptions.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">🎬 CG</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.cgTrigger || ''}
            onChange={(e) => onUpdate?.({ ...dialogue, cgTrigger: e.target.value || undefined })}>
            <option value="">无</option>
            {cgOptions.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">⚡ 画面特效</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.screenEffect || 'none'}
            onChange={(e) => onUpdate?.({ ...dialogue, screenEffect: e.target.value as any })}>
            <option value="none">无</option><option value="shake">震动</option><option value="flash_white">闪白</option><option value="flash_black">闪黑</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">✨ 转场</label>
          <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs" value={dialogue.transition || 'cut'}
            onChange={(e) => onUpdate?.({ ...dialogue, transition: e.target.value as any })}>
            <option value="cut">硬切</option><option value="fade">淡入淡出</option><option value="dissolve">溶解</option><option value="wipe">擦除</option>
          </select>
        </div>
      </div>
    </>
  )
}
