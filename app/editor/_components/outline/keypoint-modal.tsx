'use client'

import { useState, useEffect } from 'react'
import { FileText, X, Sparkles, Loader2 } from 'lucide-react'
import type { KeyPointModalProps } from '@/app/editor/_lib/types'

export function KeyPointModal({ isOpen, onClose, keyPoint, chapterTitle, onSave, onAIGenerate, isGenerating }: KeyPointModalProps) {
  const [name, setName] = useState('')
  const [showError, setShowError] = useState(false)

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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-pink-500" />
            <h3 className="text-sm font-semibold">编辑小节</h3>
          </div>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="小节名称" autoFocus
          className="w-full rounded-lg border px-3 py-2 text-sm mb-1" />
        {showError && !name.trim() && <p className="text-xs text-red-400 mb-2">名称不能为空</p>}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm">取消</button>
          <button onClick={handleSave} className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
