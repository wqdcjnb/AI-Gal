'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import type { Ending, EndingModalProps } from '@/app/editor/_lib/types'
import { endingLabels } from '@/app/editor/_lib/constants'

export function EndingModal({ isOpen, onClose, ending, onSave, onAIGenerate, isGenerating }: EndingModalProps) {
  const [type, setType] = useState<Ending['type']>('GE')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (ending) {
      setType(ending.type)
      setName(ending.name)
      setDescription(ending.description || '')
      setShowError(false)
    }
  }, [ending])

  if (!isOpen || !ending) return null

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      setShowError(true)
      return
    }
    onSave({ ...ending, type, name, description })
    onClose()
  }

  const endingConfig = endingLabels[type]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-pink-100">
              <span className="text-xl">{endingConfig?.emoji || '🎭'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">编辑结局</h3>
              <p className="text-xs text-muted-foreground">设置结局的类型和描述</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onAIGenerate && (
              <button
                onClick={() => onAIGenerate(ending.id)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-violet-600 hover:bg-violet-50 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                AI一键生成
              </button>
            )}
            <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">结局类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Ending['type'])}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            >
              <option value="GE">🌸 Good End - 好结局</option>
              <option value="NE">🌿 Normal End - 普通结局</option>
              <option value="BE">💀 Bad End - 坏结局</option>
              <option value="TE">⭐ True End - 真结局</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              结局名称 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入结局名称..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            {showError && !name.trim() && (
              <p className="mt-1 text-xs text-red-400">结局名称不能为空</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              结局描述 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个结局的内容..."
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            {showError && !description.trim() && (
              <p className="mt-1 text-xs text-red-400">结局描述不能为空</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-200/50 hover:shadow-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
