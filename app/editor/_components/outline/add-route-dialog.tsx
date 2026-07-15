'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, Loader2, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AddRouteDialogProps } from '@/app/editor/_lib/types'

export function AddRouteDialog({ isOpen, onClose, onSave, onAIGenerate, initialData, isEndingMode, onDelete }: AddRouteDialogProps) {
  const [routeName, setRouteName] = useState('')
  const [endingType, setEndingType] = useState('Good End')
  const [description, setDescription] = useState('')
  const [chapterCount, setChapterCount] = useState(1)
  const [showError, setShowError] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const isEditMode = !!initialData

  useEffect(() => {
    if (isOpen) {
      setRouteName(initialData?.routeName || '')
      setEndingType(initialData?.endingType || 'Good End')
      setDescription(initialData?.description || '')
      setChapterCount(initialData?.chapterCount || 3)
      setShowError(false)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSave = () => {
    if (!routeName.trim()) {
      setShowError(true)
      return
    }
    onSave(routeName, endingType, chapterCount)
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
          <h3 className="text-lg font-semibold text-foreground">{isEndingMode ? (isEditMode ? '编辑结局' : '添加新结局') : (isEditMode ? '编辑路线' : '添加新路线')}</h3>
          <div className="flex items-center gap-2">
            {onAIGenerate && (
              <button onClick={handleAIGenerate} disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-pink-100 to-violet-100 px-3 py-1.5 text-xs font-medium text-pink-700 hover:from-pink-200 hover:to-violet-200 disabled:opacity-50">
                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                AI 一键生成
              </button>
            )}
            {isEditMode && onDelete && (
              <button onClick={() => setShowDelete(true)}
                className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          {showDelete && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowDelete(false)}>
              <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-sm font-semibold">确认删除</h3>
                <p className="mt-1 text-xs text-muted-foreground">确定要删除这条路线的所有章节吗？</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setShowDelete(false)} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                  <button onClick={() => { onDelete?.(); setShowDelete(false); onClose() }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* For ending mode: name + type + count in one row */}
          {isEndingMode && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  结局名称 <span className="text-red-400">*</span>
                </label>
                <input type="text" value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="如：樱花结局、真结局..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100" />
                {showError && !routeName.trim() && (
                  <p className="mt-1 text-xs text-red-400">结局名称不能为空</p>
                )}
              </div>
            </div>
          )}
          {isEndingMode && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block text-sm font-medium text-foreground">结局类型</label>
                <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                  value={endingType} onChange={(e) => setEndingType(e.target.value)}>
                  <option value="Good End">🌸 Good End</option>
                  <option value="Normal End">📘 Normal End</option>
                  <option value="Bad End">💀 Bad End</option>
                  <option value="True End">👑 True End</option>
                </select>
              </div>
              {!isEditMode && (
              <div className="w-28">
                <label className="mb-1.5 block text-sm font-medium text-foreground">章节数</label>
                <Select value={chapterCount.toString()} onValueChange={(v) => setChapterCount(parseInt(v))}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 章</SelectItem><SelectItem value="2">2 章</SelectItem>
                    <SelectItem value="3">3 章</SelectItem><SelectItem value="4">4 章</SelectItem>
                    <SelectItem value="5">5 章</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              )}
            </div>
          )}
          {/* Route name + count for branching */}
          {!isEndingMode && (
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                路线名称 <span className="text-red-400">*</span>
              </label>
              <input type="text" value={routeName} onChange={(e) => setRouteName(e.target.value)}
                placeholder="如：樱花线、雪乃线..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100" />
              {showError && !routeName.trim() && (
                <p className="mt-1 text-xs text-red-400">路线名称不能为空</p>
              )}
            </div>
            {!isEditMode && (
            <div className="w-28">
              <label className="mb-1.5 block text-sm font-medium text-foreground">章节数</label>
              <Select value={chapterCount.toString()} onValueChange={(v) => setChapterCount(parseInt(v))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 章</SelectItem><SelectItem value="2">2 章</SelectItem>
                  <SelectItem value="3">3 章</SelectItem><SelectItem value="4">4 章</SelectItem>
                  <SelectItem value="5">5 章</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}
          </div>
          )}
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
