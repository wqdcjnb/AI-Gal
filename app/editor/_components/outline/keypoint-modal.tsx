'use client'

import { useState, useEffect } from 'react'
import { FileText, X, Sparkles, Loader2, Trash2 } from 'lucide-react'
import type { KeyPointModalProps } from '@/app/editor/_lib/types'

export function KeyPointModal({ isOpen, onClose, keyPoint, chapterTitle, onSave, onDelete, onAIGenerate, isGenerating }: KeyPointModalProps) {
  const [name, setName] = useState('')
  const [showError, setShowError] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (keyPoint) {
      setName(keyPoint.text)
      setShowError(false)
    }
  }, [keyPoint])

  if (!isOpen || !keyPoint) return null

  const handleSave = () => {
    if (!name.trim()) {
      setShowError(true)
      return
    }
    onSave({ ...keyPoint, text: name })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">编辑小节</h3>
            {chapterTitle && <p className="text-xs text-muted-foreground">{chapterTitle}</p>}
          </div>
          <div className="flex items-center gap-1">
            {onAIGenerate && (
              <button onClick={() => onAIGenerate(keyPoint.id)} disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-50 disabled:opacity-50">
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI一键生成
              </button>
            )}
            {onDelete && (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(false)}>
            <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold">确认删除</h3>
              <p className="mt-1 text-xs text-muted-foreground">确定要删除这个小节吗？</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                <button onClick={() => { onDelete?.(keyPoint.id); setShowDeleteConfirm(false); onClose() }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
              </div>
            </div>
          </div>
        )}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="小节名称" autoFocus
          className="w-full rounded-lg border px-3 py-2 text-sm mb-1" />
        {showError && !name.trim() && <p className="text-xs text-red-400 mb-2">名称不能为空</p>}
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm">取消</button>
          <button onClick={handleSave} className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
