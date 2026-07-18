'use client'

import { useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'

export function EmptyOutline({ onGenerate }: { onGenerate: (description?: string) => void }) {
  const [description, setDescription] = useState('')

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 p-8">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-violet-100">
          <Sparkles className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">AI 生成大纲</h3>
          <p className="text-xs text-muted-foreground">描述你的故事想法，或留空让 AI 自由发挥</p>
        </div>
      </div>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="描述你想要的故事，留空则 AI 根据项目设定自由发挥..."
        className="mb-4 h-32 w-full max-w-md resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
      />

      <button
        onClick={() => onGenerate(description || undefined)}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg"
      >
        <Sparkles className="h-4 w-4" />
        开始生成
      </button>
    </div>
  )
}
