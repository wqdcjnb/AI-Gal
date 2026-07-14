'use client'

import { FileText, Sparkles } from 'lucide-react'

export function EmptyOutline({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-violet-100">
        <FileText className="h-8 w-8 text-pink-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">还没有大纲</h3>
      <p className="mb-6 text-sm text-muted-foreground">
        点击「AI 生成大纲」，根据你的设定自动生成章节结构
      </p>
      <button
        onClick={onGenerate}
        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg"
      >
        <Sparkles className="h-4 w-4" />
        AI 生成大纲
      </button>
    </div>
  )
}
