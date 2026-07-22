'use client'

import { X } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'

export function UndoToasts() {
  const {
    showUndoToast,
    deletedChapter,
    undoDelete,
    dismissUndoToast,
  } = useProject()

  return (
    <>
      {/* Chapter Undo Toast */}
      {(showUndoToast || deletedChapter) && deletedChapter && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${showUndoToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
            <span className="text-sm">已删除「{deletedChapter.chapter.title}」</span>
            <button onClick={undoDelete} className="rounded bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30">撤销</button>
            <button onClick={dismissUndoToast} className="text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

    </>
  )
}
