'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Check, X, Plus, MapPin, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { routeLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { ChapterCardProps } from '@/app/editor/_lib/types'

export function ChapterCard({
  chapter,
  compact = false,
  isMultiEnding = false,
  isBranching = false,
  displayNumber,
  onEditSummaryChange,
  onSaveEdit,
  onCancelEdit,
  onEditChapter,
  onAddKeyPoint,
  onDeleteKeyPoint,
  onKeyPointClick,
  cardColors,
}: ChapterCardProps) {
  const { requestDeleteChapter } = useProject()
  const routeInfo = chapter.route ? routeLabels[chapter.route] : null
  const [isEditingSummary, setIsEditingSummary] = useState(false)
  const [localSummary, setLocalSummary] = useState(chapter.summary)
  const isCommonRoute = chapter.route === 'common'

  // Color scheme based on route, with optional override
  const colors = cardColors || (isCommonRoute ? ({
    border: 'border-blue-100',
    shadow: 'hover:shadow-blue-100/50',
    numberBg: 'from-blue-100 to-sky-100',
    numberText: 'text-blue-700',
    dot: 'bg-blue-300',
    hoverBg: 'hover:bg-blue-50',
    buttonText: 'text-blue-500 hover:text-blue-600',
    focusRing: 'focus:bg-blue-50',
  }) : ({
    border: 'border-pink-100',
    shadow: 'hover:shadow-pink-100/50',
    numberBg: 'from-pink-100 to-violet-100',
    numberText: 'text-pink-700',
    dot: 'bg-pink-300',
    hoverBg: 'hover:bg-pink-50',
    buttonText: 'text-pink-500 hover:text-pink-600',
    focusRing: 'focus:bg-pink-50',
  }))

  // Sync local summary when chapter changes
  useEffect(() => {
    setLocalSummary(chapter.summary)
  }, [chapter.summary])

  // Collapse state
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSummarySave = () => {
    onEditChapter({ ...chapter, summary: localSummary })
    setIsEditingSummary(false)
  }

  return (
    <div
      className={cn(
        'group relative rounded-xl border bg-white transition-all hover:shadow-md',
        colors.border,
        colors.shadow,
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Header - Clickable to collapse/expand */}
      <div className="flex items-start gap-3">
        {/* Collapse Toggle + Chapter Number */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("rounded p-0.5 text-muted-foreground hover:text-foreground transition-transform", isCollapsed && "-rotate-90")}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <div className={cn(
            'flex items-center justify-center rounded-lg bg-gradient-to-br font-semibold',
            colors.numberBg,
            compact ? 'min-h-[32px] min-w-[32px] px-2 text-xs' : 'min-h-[40px] min-w-[40px] px-2.5 text-sm',
            colors.numberText
          )}>
            第{toChineseNumber(displayNumber ?? chapter.number)}章
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Summary - Always visible, click to edit when expanded */}
          {isEditingSummary ? (
            <div className="space-y-2">
              <textarea
                value={localSummary}
                onChange={(e) => setLocalSummary(e.target.value)}
                rows={2}
                className={cn("w-full rounded-lg border bg-white px-3 py-2 text-sm text-muted-foreground outline-none focus:ring-2 resize-none", isCommonRoute ? "border-blue-200 focus:ring-blue-100" : "border-pink-200 focus:ring-pink-100")}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSummarySave}
                  className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white"
                >
                  <Check className="h-3 w-3" />
                  保存
                </button>
                <button
                  onClick={() => { setIsEditingSummary(false); setLocalSummary(chapter.summary) }}
                  className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  取消
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => !isCollapsed && setIsEditingSummary(true)}
              className={cn(
                'cursor-pointer rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors',
                colors.hoverBg,
                'hover:text-foreground',
                compact && 'text-xs',
                isCollapsed && 'cursor-default'
              )}
            >
              {chapter.summary}
            </p>
          )}

          {/* Collapsible Content */}
          {!isCollapsed && (
            <>
              {/* Scenes - Editable (hidden in multi-ending and branching mode) */}
              {!isMultiEnding && !isBranching && (
                <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                  <MapPin className="h-3 w-3 text-muted-foreground/60" />
                  {chapter.scenes.map((scene, idx) => (
                    <span key={idx} className="inline-flex items-center gap-0.5">
                      <input
                        type="text"
                        value={scene}
                        readOnly
                        className={cn("bg-transparent text-xs text-muted-foreground outline-none rounded px-1 w-16", colors.focusRing)}
                      />
                      {idx < chapter.scenes.length - 1 && <span className="text-muted-foreground/40">/</span>}
                    </span>
                  ))}
                  <button className={cn("transition-colors", colors.buttonText)}>
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Key Points / Sub-sections - Click to open modal */}
              <div className="mt-2 space-y-1">
                {chapter.keyPoints.map((kp) => (
                  <div key={kp.id} className="flex items-start gap-2 group/kp">
                    <button
                      onClick={() => onKeyPointClick?.(chapter.id, kp.id)}
                      className={cn("flex-1 flex items-start gap-2 text-left rounded-md px-1 py-0.5 -ml-1 transition-colors", colors.hoverBg)}
                    >
                      <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", colors.dot)} />
                      <span className="text-xs text-muted-foreground hover:text-foreground">
                        {kp.text}
                      </span>
                      {kp.description && (
                        <span className="text-[10px] text-muted-foreground/60 truncate max-w-[120px]">
                          · {kp.description}
                        </span>
                      )}
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => onAddKeyPoint(chapter.id)}
                  className={cn("flex items-center gap-1 text-xs ml-3", colors.buttonText)}
                >
                  <Plus className="h-3 w-3" />
                  添加小节
                </button>
              </div>
            </>
          )}
        </div>

        {/* Actions (hover) - Only delete */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => requestDeleteChapter(chapter.id)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
