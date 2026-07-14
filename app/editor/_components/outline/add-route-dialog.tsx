'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AddRouteDialogProps } from '@/app/editor/_lib/types'

export function AddRouteDialog({ isOpen, onClose, onSave, onAIGenerate, initialData }: AddRouteDialogProps) {
  const [routeName, setRouteName] = useState('')
  const [description, setDescription] = useState('')
  const [chapterCount, setChapterCount] = useState(3)
  const [showError, setShowError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const isEditMode = !!initialData

  useEffect(() => {
    if (isOpen) {
      setRouteName(initialData?.routeName || '')
      setDescription(initialData?.description || '')
      setChapterCount(initialData?.chapterCount || 3)
      setShowError(false)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSave = () => {
    if (!routeName.trim() || !description.trim()) {
      setShowError(true)
      return
    }
    onSave(routeName, description, chapterCount)
    onClose()
  }

  const handleAIGenerate = async () => {
    if (onAIGenerate) {
      setIsGenerating(true)
      try {
        const result = await onAIGenerate()
        if (result.name) setRouteName(result.name)
        if (result.description) setDescription(result.description)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{isEditMode ? '编辑路线' : '添加新路线'}</h3>
          <div className="flex items-center gap-2">
            {onAIGenerate && (
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-100 to-violet-100 px-3 py-1.5 text-xs font-medium text-pink-700 hover:from-pink-200 hover:to-violet-200 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                AI 一键生成
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Route Name + Chapter Count inline */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                路线名称 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="如：樱花线、雪乃线..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
              />
              {showError && !routeName.trim() && (
                <p className="mt-1 text-xs text-red-400">路线名称不能为空</p>
              )}
            </div>
            <div className="w-28">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                章节数
              </label>
              <Select
                value={chapterCount.toString()}
                onValueChange={(v) => setChapterCount(parseInt(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 章</SelectItem>
                  <SelectItem value="2">2 章</SelectItem>
                  <SelectItem value="3">3 章</SelectItem>
                  <SelectItem value="4">4 章</SelectItem>
                  <SelectItem value="5">5 章</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              路线描述 <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这条路线的故事内容..."
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
            />
            {showError && !description.trim() && (
              <p className="mt-1 text-xs text-red-400">路线描述不能为空</p>
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
            {isEditMode ? '保存修改' : '添加路线'}
          </button>
        </div>
      </div>
    </div>
  )
}
