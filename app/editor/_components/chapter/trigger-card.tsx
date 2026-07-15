'use client'

import { useState } from 'react'
import { Zap, Settings, Plus, X, Trash2 } from 'lucide-react'
import type { Trigger, TriggerCondition } from '@/app/editor/_lib/types'
import { Cascader } from '@/app/editor/_components/chapter/cascader'

// ── Trigger Card (display) ──
export function TriggerCard({ trigger, onEdit }: { trigger: Trigger; onEdit: () => void }) {
  const choices = trigger.conditions.length
  return (
    <div className="group rounded-lg border-2 border-dashed border-cyan-400/50 bg-cyan-50/20 p-3 hover:border-cyan-400 cursor-pointer"
      onClick={onEdit}>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-cyan-500" />
        <span className="rounded bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">触发器</span>
        <span className="text-sm font-medium text-foreground truncate">{trigger.name || '未命名'}</span>
        <div className="flex-1" />
        <span className="text-[10px] text-muted-foreground">{trigger.logic === 'and' ? '全部满足' : '任一满足'}</span>
        <span className="text-[10px] text-muted-foreground">→ {trigger.jumpTarget || '未设置'}</span>
        <Settings className="h-3 w-3 text-muted-foreground" />
      </div>
      {choices > 0 && (
        <p className="mt-1 text-[10px] text-muted-foreground pl-7">{choices} 个条件</p>
      )}
    </div>
  )
}

// ── Trigger Panel (create/edit) ──
export function TriggerPanel({
  trigger,
  choiceOptions,
  subSectionIds,
  onSave,
  onDelete,
  onClose,
}: {
  trigger?: Trigger
  choiceOptions: { dialogueId: string; dialoguePrompt: string; options: { text: string; index: number }[] }[]
  subSectionIds?: { value: string; label: string; children?: { value: string; label: string }[] }[]
  onSave: (t: Trigger) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [name, setName] = useState(trigger?.name || '')
  const [conditions, setConditions] = useState<TriggerCondition[]>(trigger?.conditions || [])
  const [logic, setLogic] = useState<'and' | 'or'>(trigger?.logic || 'and')
  const [jumpTarget, setJumpTarget] = useState(trigger?.jumpTarget || '')
  const [showDelete, setShowDelete] = useState(false)

  const isNew = !trigger

  const addCondition = () => {
    setConditions([...conditions, { choiceDialogueId: '', optionIndex: 0 }])
  }

  const updateCondition = (i: number, data: Partial<TriggerCondition>) => {
    const nc = [...conditions]
    nc[i] = { ...nc[i], ...data }
    setConditions(nc)
  }

  const removeCondition = (i: number) => {
    setConditions(conditions.filter((_, j) => j !== i))
  }

  // Find the selected choice's options
  const getOptionsForChoice = (dialogueId: string) => {
    return choiceOptions.find(c => c.dialogueId === dialogueId)?.options || []
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl mx-4 flex flex-col" style={{ height: '70vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 pb-2 shrink-0">
          <h3 className="text-sm font-semibold text-foreground">{isNew ? '新建触发器' : '编辑触发器'}</h3>
          {!isNew && (
            <>
              <button onClick={() => setShowDelete(true)}
                className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
              {showDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowDelete(false)}>
                  <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-sm font-semibold">确认删除</h3>
                    <p className="mt-1 text-xs text-muted-foreground">确定要删除这个触发器吗？</p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setShowDelete(false)} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                      <button onClick={() => { onDelete?.(); onClose() }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <label className="text-[10px] text-muted-foreground mb-1 block">名称</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3"
          placeholder="触发器名称" />

        {/* Logic toggle */}
        <label className="text-[10px] text-muted-foreground mb-1 block">条件逻辑</label>
        <div className="flex rounded-lg bg-muted p-0.5 mb-3">
          <button onClick={() => setLogic('and')}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors ${logic === 'and' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            全部满足 (AND)
          </button>
          <button onClick={() => setLogic('or')}
            className={`flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors ${logic === 'or' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            任一满足 (OR)
          </button>
        </div>

        {/* Conditions */}
        <label className="text-[10px] text-muted-foreground mb-1 block">条件 ({conditions.length})</label>
        <div className="space-y-1.5 mb-3">
          {conditions.map((cond, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground w-5">{i + 1}.</span>
              <select className="flex-1 rounded border border-border bg-background px-2 py-1 text-[10px]"
                value={cond.choiceDialogueId}
                onChange={e => updateCondition(i, { choiceDialogueId: e.target.value, optionIndex: 0 })}>
                <option value="">选择...</option>
                {choiceOptions.map(co => <option key={co.dialogueId} value={co.dialogueId}>{co.dialoguePrompt || '(无名称)'}</option>)}
              </select>
              <select className="rounded border border-border bg-background px-2 py-1 text-[10px]"
                value={cond.optionIndex}
                onChange={e => updateCondition(i, { optionIndex: parseInt(e.target.value) })}>
                {getOptionsForChoice(cond.choiceDialogueId).map(o => (
                  <option key={o.index} value={o.index}>{o.index + 1}. {o.text || '(空)'}</option>
                ))}
              </select>
              <button onClick={() => removeCondition(i)} className="text-muted-foreground hover:text-red-400"><X className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
        <button onClick={addCondition}
          className="w-full rounded-lg border border-dashed border-border py-1.5 text-xs text-muted-foreground hover:border-amber-300 hover:text-amber-600 mb-3">
          <Plus className="h-3 w-3 inline mr-1" />添加条件
        </button>

        {/* Jump target */}
        <label className="text-[10px] text-muted-foreground mb-1 block">跳转到</label>
        <Cascader options={(subSectionIds || []) as any} value={jumpTarget} onChange={setJumpTarget} placeholder="选择章节 / 小节" />
        <div className="mb-4" />

        </div>

        {/* Fixed footer */}
        <div className="shrink-0 p-5 pt-2 flex gap-2 border-t border-border">
          <button onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm">取消</button>
          <button onClick={() => onSave({ id: trigger?.id || `tr-${Date.now()}`, name, conditions, logic, jumpTarget })}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
