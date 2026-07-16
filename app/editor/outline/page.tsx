'use client'

import { useState } from 'react'
import { Sparkles, Loader2, X } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { KeyPoint } from '@/app/editor/_lib/types'
import { TimelineView } from '@/app/editor/_components/outline/timeline-view'
import { TreeView } from '@/app/editor/_components/outline/tree-view'
import { KeyPointModal } from '@/app/editor/_components/outline/keypoint-modal'
import { AddRouteDialog } from '@/app/editor/_components/outline/add-route-dialog'
import { EmptyOutline } from '@/app/editor/_components/outline/empty-outline'
import { GeneratingSkeleton } from '@/app/editor/_components/outline/generating-skeleton'

export default function OutlinePage() {
  const {
    project,
    isGenerating,
    handleGenerateOutline,
    saveProject,
    addChapter,
    requestDeleteChapter,
    addKeyPoint,
    updateKeyPoint,
    updateKeyPointData,
    deleteKeyPoint,
    addRoute,
    handleAIGenerateKeyPoint,
    isGeneratingKeyPoint,
    editingChapterId,
    editTitle,
    editSummary,
    setEditTitle,
    setEditSummary,
    startEditing,
    saveEdit,
    cancelEdit,
  } = useProject()

  // Local UI state (must be before any early returns)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [generateDescription, setGenerateDescription] = useState('')
  const [keyPointModalOpen, setKeyPointModalOpen] = useState(false)
  const [selectedKeyPoint, setSelectedKeyPoint] = useState<{ chapterId: string; keyPoint: KeyPoint } | null>(null)
  const [isNewKeyPoint, setIsNewKeyPoint] = useState(false)
  const [addRouteDialogOpen, setAddRouteDialogOpen] = useState(false)
  const [editRouteDialogOpen, setEditRouteDialogOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<string | null>(null)
  // Undo state for route and keypoint deletion
  const [undoData, setUndoData] = useState<{ chapters?: Chapter[]; keyPoint?: { chapterId: string; keyPoint: KeyPoint } } | null>(null)
  const [showUndo, setShowUndo] = useState(false)

  if (!project) return null

  const isBranching = project.narrativeStructure === '分支叙事' || project.narrativeStructure === '多结局'
  const isMultiEnding = project.narrativeStructure === '多结局'

  // Key Point handlers
  const handleKeyPointClick = (chapterId: string, keyPointId: string) => {
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    const keyPoint = chapter?.keyPoints.find(kp => kp.id === keyPointId)
    if (keyPoint) {
      setSelectedKeyPoint({ chapterId, keyPoint })
      setIsNewKeyPoint(false)
      setKeyPointModalOpen(true)
    }
  }

  const handleAddKeyPoint = (chapterId: string) => {
    const newKeyPoint: KeyPoint = {
      id: `kp-${Date.now()}`,
      text: '',
      description: '',
    }
    setSelectedKeyPoint({ chapterId, keyPoint: newKeyPoint })
    setIsNewKeyPoint(true)
    setKeyPointModalOpen(true)
  }

  const handleKeyPointSave = (keyPoint: KeyPoint) => {
    if (isNewKeyPoint && selectedKeyPoint) {
      addKeyPoint(selectedKeyPoint.chapterId, keyPoint)
    } else {
      updateKeyPointData(keyPoint)
    }
    setSelectedKeyPoint(null)
    setIsNewKeyPoint(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">故事大纲</h2>
          <span className="rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600">
            {project.narrativeStructure}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGenerateDialog(true)}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg hover:shadow-pink-300/50 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI 生成
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {isGenerating ? (
        <GeneratingSkeleton count={project.chapterCount} />
      ) : project.chapters.length === 0 ? (
        <EmptyOutline onGenerate={() => handleGenerateOutline()} />
      ) : isBranching ? (
        <TreeView
          chapters={project.chapters}
          isBranching={isBranching}
          isMultiEnding={isMultiEnding}
          onAddRoute={addRoute}
          onAddChapter={addChapter}
          onOpenAddRouteDialog={() => setAddRouteDialogOpen(true)}
          onEditRoute={(route) => { setEditingRoute(route); setEditRouteDialogOpen(true) }}
          editingChapterId={editingChapterId}
          editTitle={editTitle}
          editSummary={editSummary}
          onEditTitleChange={setEditTitle}
          onEditSummaryChange={setEditSummary}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onEditChapter={startEditing}
          onDeleteChapter={requestDeleteChapter}
          onAddKeyPoint={handleAddKeyPoint}
          onUpdateKeyPoint={updateKeyPoint}
          onDeleteKeyPoint={deleteKeyPoint}
          onKeyPointClick={handleKeyPointClick}
        />
      ) : (
        <TimelineView
          chapters={project.chapters}
          editingChapterId={editingChapterId}
          editTitle={editTitle}
          editSummary={editSummary}
          onEditTitleChange={setEditTitle}
          onEditSummaryChange={setEditSummary}
          onSaveEdit={saveEdit}
          onCancelEdit={cancelEdit}
          onEditChapter={startEditing}
          onDeleteChapter={requestDeleteChapter}
          onAddKeyPoint={handleAddKeyPoint}
          onUpdateKeyPoint={updateKeyPoint}
          onDeleteKeyPoint={deleteKeyPoint}
          onKeyPointClick={handleKeyPointClick}
        />
      )}

      {/* Key Point Modal */}
      <KeyPointModal
        isOpen={keyPointModalOpen}
        onClose={() => setKeyPointModalOpen(false)}
        keyPoint={selectedKeyPoint?.keyPoint || null}
        chapterTitle={selectedKeyPoint ? `第${toChineseNumber(project.chapters.find(ch => ch.id === selectedKeyPoint.chapterId)?.number || 1)}章` : ''}
        onSave={handleKeyPointSave}
        onDelete={(keyPointId) => {
          if (selectedKeyPoint) {
            const kp = selectedKeyPoint.keyPoint
            deleteKeyPoint(selectedKeyPoint.chapterId, keyPointId)
            setUndoData({ keyPoint: { chapterId: selectedKeyPoint.chapterId, keyPoint: kp } })
            setShowUndo(true)
            setTimeout(() => { setShowUndo(false); setTimeout(() => setUndoData(null), 500) }, 5000)
          }
        }}
        onAIGenerate={handleAIGenerateKeyPoint}
        isGenerating={isGeneratingKeyPoint}
      />

      {/* AI Generate Dialog */}
      {showGenerateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-violet-100">
                <Sparkles className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">AI 生成大纲</h3>
                <p className="text-xs text-muted-foreground">描述你的故事想法，或留空让 AI 自由发挥</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  故事描述 <span className="text-xs font-normal text-muted-foreground">（可选）</span>
                </label>
                <textarea
                  value={generateDescription}
                  onChange={(e) => setGenerateDescription(e.target.value)}
                  placeholder="描述你想要的故事，留空则 AI 根据项目设定自由发挥..."
                  className="h-32 w-full resize-none rounded-lg border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-100"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowGenerateDialog(false)
                  setGenerateDescription('')
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                取消
              </button>
              <button
                onClick={() => {
                  handleGenerateOutline(generateDescription || undefined)
                  setShowGenerateDialog(false)
                  setGenerateDescription('')
                }}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                开始生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Route Dialog */}
      <AddRouteDialog
        isOpen={addRouteDialogOpen}
        isEndingMode={isMultiEnding}
        onClose={() => setAddRouteDialogOpen(false)}
        onSave={(routeName, endingType, chapterCount) => {
          addRoute(routeName, chapterCount, isMultiEnding ? endingType : undefined)
          setAddRouteDialogOpen(false)
        }}
        onAIGenerate={async () => {
          await new Promise(resolve => setTimeout(resolve, 1200))
          const names = ['樱花线', '雪乃线', '凛线', '飞鸟线', '小鸟线', '千晶线']
          const descriptions = [
            '与她在樱花飘落的坡道相遇，一段温暖而治愈的故事就此展开。',
            '冬日里的邂逅，如同初雪般纯净的感情在两人之间悄然萌芽。',
            '性格强势的她，内心却藏着不为人知的柔软，只有你能触及。',
            '自由如风的少女，带着你一起追逐那些被遗忘的梦想。',
            '安静内向的她，在图书馆的角落里与你分享着同一个世界。',
            '神秘的前辈，引导你走进一个全新的世界，揭开层层谜团。',
          ]
          const name = names[Math.floor(Math.random() * names.length)]
          const description = descriptions[Math.floor(Math.random() * descriptions.length)]
          return { name, description }
        }}
      />

      {/* Edit Route Dialog */}
      <AddRouteDialog
        isOpen={editRouteDialogOpen}
        isEndingMode={isMultiEnding}
        onClose={() => {
          setEditRouteDialogOpen(false)
          setEditingRoute(null)
        }}
        onDelete={() => {
          if (editingRoute) {
            const deletedChapters = project.chapters.filter(ch => ch.route === editingRoute)
            const updatedChapters = project.chapters.filter(ch => ch.route !== editingRoute)
            saveProject({ ...project, chapters: updatedChapters })
            setUndoData({ chapters: deletedChapters })
            setShowUndo(true)
            setTimeout(() => { setShowUndo(false); setTimeout(() => setUndoData(null), 500) }, 5000)
          }
        }}
        initialData={(() => {
          if (!editingRoute) return undefined
          const routeChapters = project.chapters.filter(ch => ch.route === editingRoute)
          if (routeChapters.length === 0) return undefined
          return {
            routeName: editingRoute,
            endingType: routeChapters[0]?.endingType || 'Good End',
            description: routeChapters[0]?.summary || '',
            chapterCount: routeChapters.length,
          }
        })()}
        onSave={(routeName: string, endingType?: string) => {
          if (isMultiEnding && (routeName !== editingRoute || endingType)) {
            const updatedChapters = project.chapters.map(ch =>
              ch.route === editingRoute ? { ...ch, route: routeName, endingType: endingType || ch.endingType, title: routeName } : ch
            )
            saveProject({ ...project, chapters: updatedChapters })
          } else if (!isMultiEnding && routeName !== editingRoute) {
            const updatedChapters = project.chapters.map(ch =>
              ch.route === editingRoute ? { ...ch, route: routeName } : ch
            )
            saveProject({ ...project, chapters: updatedChapters })
          }
          setEditRouteDialogOpen(false)
          setEditingRoute(null)
        }}
        onAIGenerate={async () => {
          await new Promise(resolve => setTimeout(resolve, 1200))
          const descriptions = [
            '与她在樱花飘落的坡道相遇，一段温暖而治愈的故事就此展开。',
            '冬日里的邂逅，如同初雪般纯净的感情在两人之间悄然萌芽。',
            '性格强势的她，内心却藏着不为人知的柔软，只有你能触及。',
            '自由如风的少女，带着你一起追逐那些被遗忘的梦想。',
            '安静内向的她，在图书馆的角落里与你分享着同一个世界。',
          ]
          const description = descriptions[Math.floor(Math.random() * descriptions.length)]
          return { description }
        }}
      />

      {/* Undo Toast */}
      {undoData && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${showUndo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          onTransitionEnd={() => { if (!showUndo) setUndoData(null) }}>
          <div className="flex items-center gap-3 rounded-lg bg-gray-900 px-4 py-3 text-white shadow-lg">
            <span className="text-sm">
              {undoData.chapters ? `已删除路线「${undoData.chapters[0]?.route || editingRoute}」` : undoData.keyPoint ? `已删除小节「${undoData.keyPoint.keyPoint.text}」` : ''}
            </span>
            <button onClick={() => {
              if (undoData.chapters) {
                saveProject({ ...project, chapters: [...project.chapters, ...undoData.chapters] })
              } else if (undoData.keyPoint) {
                addKeyPoint(undoData.keyPoint.chapterId, undoData.keyPoint.keyPoint)
              }
              setShowUndo(false)
              setUndoData(null)
            }} className="rounded bg-white/20 px-3 py-1 text-sm font-medium hover:bg-white/30">撤销</button>
            <button onClick={() => { setShowUndo(false) }} className="text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  )
}

