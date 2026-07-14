'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Flag, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { endingLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { KeyPoint, Ending } from '@/app/editor/_lib/types'
import { TimelineView } from '@/app/editor/_components/outline/timeline-view'
import { TreeView } from '@/app/editor/_components/outline/tree-view'
import { KeyPointModal } from '@/app/editor/_components/outline/keypoint-modal'
import { EndingModal } from '@/app/editor/_components/outline/ending-modal'
import { AddRouteDialog } from '@/app/editor/_components/outline/add-route-dialog'
import { EmptyOutline } from '@/app/editor/_components/outline/empty-outline'
import { GeneratingSkeleton } from '@/app/editor/_components/outline/generating-skeleton'

export default function OutlinePage() {
  const {
    project,
    isGenerating,
    handleGenerateOutline,
    addChapter,
    requestDeleteChapter,
    addKeyPoint,
    updateKeyPoint,
    updateKeyPointData,
    deleteKeyPoint,
    addRoute,
    addEnding,
    updateEnding,
    requestDeleteEnding,
    handleAIGenerateKeyPoint,
    isGeneratingKeyPoint,
    handleAIGenerateEnding,
    isGeneratingEnding,
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
  const [endingModalOpen, setEndingModalOpen] = useState(false)
  const [selectedEnding, setSelectedEnding] = useState<Ending | null>(null)
  const [isNewEnding, setIsNewEnding] = useState(false)

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

  // Ending handlers
  const handleEndingClick = (ending: Ending) => {
    setSelectedEnding(ending)
    setIsNewEnding(false)
    setEndingModalOpen(true)
  }

  const handleAddEnding = () => {
    const endingTypes: Ending['type'][] = ['GE', 'NE', 'BE', 'TE']
    const existingTypes = project.endings?.map((e: Ending) => e.type) || []
    const nextType = endingTypes.find(t => !existingTypes.includes(t)) || 'GE'
    const typeLabels: Record<Ending['type'], string> = {
      GE: 'Good End',
      NE: 'Normal End',
      BE: 'Bad End',
      TE: 'True End',
    }
    const newEnding: Ending = {
      id: `end-${Date.now()}`,
      type: nextType,
      name: typeLabels[nextType],
      description: '',
    }
    setSelectedEnding(newEnding)
    setIsNewEnding(true)
    setEndingModalOpen(true)
  }

  const handleEndingSave = (ending: Ending) => {
    if (isNewEnding) {
      addEnding(ending)
    } else {
      updateEnding(ending.id, ending)
    }
    setSelectedEnding(null)
    setIsNewEnding(false)
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

      {/* Add Ending Button (Multi-ending mode only) */}
      {project.chapters.length > 0 && !isGenerating && isMultiEnding && (
        <button
          onClick={handleAddEnding}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/30 py-4 text-sm font-medium text-violet-600 transition-all hover:border-violet-300 hover:bg-violet-50"
        >
          <Sparkles className="h-4 w-4" />
          添加结局
        </button>
      )}

      {/* Endings Section (Multi-ending mode only) */}
      {isMultiEnding && (project.endings?.length ?? 0) > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Flag className="h-4 w-4 text-violet-500" />
            结局管理
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(project.endings || []).map((ending: Ending) => {
              const endingConfig = endingLabels[ending.type]
              return (
                <div
                  key={ending.id}
                  onClick={() => handleEndingClick(ending)}
                  className={cn(
                    'group relative cursor-pointer rounded-xl border bg-white p-4 transition-all hover:shadow-md',
                    endingConfig?.color || 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{endingConfig?.emoji || '🎭'}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {endingConfig?.label || ending.type}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); requestDeleteEnding(ending.id) }}
                      className="rounded-md p-1.5 text-muted-foreground/60 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-medium text-foreground">{ending.name}</p>
                  {ending.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{ending.description}</p>
                  )}
                  <p className="mt-2 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    点击编辑
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Key Point Modal */}
      <KeyPointModal
        isOpen={keyPointModalOpen}
        onClose={() => setKeyPointModalOpen(false)}
        keyPoint={selectedKeyPoint?.keyPoint || null}
        chapterTitle={selectedKeyPoint ? `第${toChineseNumber(project.chapters.find(ch => ch.id === selectedKeyPoint.chapterId)?.number || 1)}章` : ''}
        onSave={handleKeyPointSave}
        onAIGenerate={handleAIGenerateKeyPoint}
        isGenerating={isGeneratingKeyPoint}
      />

      {/* Ending Modal */}
      <EndingModal
        isOpen={endingModalOpen}
        onClose={() => setEndingModalOpen(false)}
        ending={selectedEnding}
        onSave={handleEndingSave}
        onAIGenerate={handleAIGenerateEnding}
        isGenerating={isGeneratingEnding}
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
        onClose={() => setAddRouteDialogOpen(false)}
        onSave={(routeName, description, chapterCount) => {
          addRoute(routeName, chapterCount)
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
        onClose={() => {
          setEditRouteDialogOpen(false)
          setEditingRoute(null)
        }}
        initialData={(() => {
          if (!editingRoute) return undefined
          const routeChapters = project.chapters.filter(ch => ch.route === editingRoute)
          if (routeChapters.length === 0) return undefined
          const routeLabelMap: Record<string, string> = { a: 'A线', b: 'B线', c: 'C线', true: 'True线' }
          return {
            routeName: routeLabelMap[editingRoute] || editingRoute,
            description: routeChapters[0]?.summary || '',
            chapterCount: routeChapters.length,
          }
        })()}
        onSave={() => {
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
    </div>
  )
}
