'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Edit3, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChapterCard } from '@/app/editor/_components/outline/chapter-card'
import type { TreeViewProps } from '@/app/editor/_lib/types'

export function TreeView({
  chapters,
  isBranching,
  isMultiEnding = false,
  onAddChapter,
  onOpenAddRouteDialog,
  onEditRoute,
  ...props
}: TreeViewProps) {
  // State for collapsed routes
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(new Set())

  const toggleRoute = (route: string) => {
    const newSet = new Set(collapsedRoutes)
    if (newSet.has(route)) {
      newSet.delete(route)
    } else {
      newSet.add(route)
    }
    setCollapsedRoutes(newSet)
  }

  // Group chapters by route
  const commonChapters = chapters.filter(ch => ch.route === 'common')
  const routeAChapters = chapters.filter(ch => ch.route === 'a')
  const routeBChapters = chapters.filter(ch => ch.route === 'b')
  const routeCChapters = chapters.filter(ch => ch.route === 'c')
  const trueChapters = chapters.filter(ch => ch.route === 'true')

  // Get all unique routes (for dynamic routes)
  const allRoutes = [...new Set(chapters.map(ch => ch.route).filter(Boolean))] as string[]
  const hasBranches = routeAChapters.length > 0 || routeBChapters.length > 0 || allRoutes.length > 2

  // For multi-ending mode, show simple list without route colors
  if (isMultiEnding) {
    return (
      <div className="space-y-3">
        {chapters.map((chapter, idx) => (
          <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} compact isMultiEnding />
        ))}

        {/* Empty state */}
        {chapters.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">暂无章节，点击「AI 生成大纲」或「添加章节」开始创作</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Common Route */}
      {commonChapters.length > 0 && (
        <div>
          <div className="rounded-lg border border-blue-200 overflow-hidden">
            {/* Route Header - Clickable to collapse/expand */}
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => toggleRoute('common')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-blue-400 transition-transform", collapsedRoutes.has('common') && "-rotate-90")} />
                <span className="text-blue-500 text-sm">📖</span>
                <span className="text-sm font-medium text-foreground">共通线</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">{commonChapters.length} 章</span>
              </div>
            </div>
            {/* Route Content - Hidden when collapsed */}
            {!collapsedRoutes.has('common') && (
              <div className="px-3 pb-3">
                <div className="mb-3 rounded-lg border-l-4 border-blue-400 bg-blue-50/50 px-4 py-2">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">共通线</span> — 所有玩家都会经历的故事内容
                  </p>
                </div>
                <div className="space-y-2">
                  {commonChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} isBranching={isBranching} />
                  ))}
                </div>
                {/* Add common route chapter button */}
                {onAddChapter && hasBranches && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-600 hover:bg-blue-50 h-7 text-xs" onClick={() => onAddChapter('common')}>
                    <Plus className="h-3 w-3 mr-1" />
                    添加共通线章节
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Point Indicator */}
      {hasBranches && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 border-t border-dashed border-pink-300" />
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-1.5">
            <GitBranch className="h-4 w-4 text-pink-600" />
            <span className="text-xs font-medium text-pink-700">分支选择点</span>
          </div>
          <div className="flex-1 border-t border-dashed border-violet-300" />
        </div>
      )}

      {/* Personal Routes Header */}
      {(routeAChapters.length > 0 || routeBChapters.length > 0 || routeCChapters.length > 0 || trueChapters.length > 0) && (
        <div className="rounded-lg border-l-4 border-pink-400 bg-pink-50/50 px-4 py-2">
          <p className="text-xs text-pink-700">
            <span className="font-medium">🎀 个人线</span> — 根据选择进入不同角色的故事线
          </p>
        </div>
      )}

      {/* Personal Routes - Each route in its own row */}
      <div className="space-y-4">
        {/* Route A */}
        {routeAChapters.length > 0 && (
          <div className="rounded-lg border border-pink-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-pink-50/50 transition-colors" onClick={() => toggleRoute('a')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-pink-400 transition-transform", collapsedRoutes.has('a') && "-rotate-90")} />
                <span className="text-pink-500 text-sm">🎀</span>
                <span className="text-sm font-medium text-foreground">A线</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-600">{routeAChapters.length} 章</span>
              </div>
              {onEditRoute && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditRoute('a') }}
                  className="rounded p-1 text-muted-foreground hover:bg-pink-100 hover:text-pink-600 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!collapsedRoutes.has('a') && (
              <div className="px-3 pb-2">
                <div className="space-y-2">
                  {routeAChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} compact isBranching={isBranching} displayNumber={commonChapters.length + idx + 1} />
                  ))}
                </div>
                {onAddChapter && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-pink-600 hover:bg-pink-50 h-7 text-xs" onClick={() => onAddChapter('a')}>
                    <Plus className="h-3 w-3 mr-1" />
                    添加章节
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Route B */}
        {routeBChapters.length > 0 && (
          <div className="rounded-lg border border-pink-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-pink-50/50 transition-colors" onClick={() => toggleRoute('b')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-pink-400 transition-transform", collapsedRoutes.has('b') && "-rotate-90")} />
                <span className="text-pink-500 text-sm">🎀</span>
                <span className="text-sm font-medium text-foreground">B线</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-600">{routeBChapters.length} 章</span>
              </div>
              {onEditRoute && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditRoute('b') }}
                  className="rounded p-1 text-muted-foreground hover:bg-pink-100 hover:text-pink-600 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!collapsedRoutes.has('b') && (
              <div className="px-3 pb-2">
                <div className="space-y-2">
                  {routeBChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} compact isBranching={isBranching} displayNumber={commonChapters.length + idx + 1} />
                  ))}
                </div>
                {onAddChapter && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-pink-600 hover:bg-pink-50 h-7 text-xs" onClick={() => onAddChapter('b')}>
                    <Plus className="h-3 w-3 mr-1" />
                    添加章节
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Route C */}
        {routeCChapters.length > 0 && (
          <div className="rounded-lg border border-pink-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-pink-50/50 transition-colors" onClick={() => toggleRoute('c')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-pink-400 transition-transform", collapsedRoutes.has('c') && "-rotate-90")} />
                <span className="text-pink-500 text-sm">🎀</span>
                <span className="text-sm font-medium text-foreground">C线</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-600">{routeCChapters.length} 章</span>
              </div>
              {onEditRoute && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditRoute('c') }}
                  className="rounded p-1 text-muted-foreground hover:bg-pink-100 hover:text-pink-600 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!collapsedRoutes.has('c') && (
              <div className="px-3 pb-2">
                <div className="space-y-2">
                  {routeCChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} compact isBranching={isBranching} displayNumber={commonChapters.length + idx + 1} />
                  ))}
                </div>
                {onAddChapter && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-pink-600 hover:bg-pink-50 h-7 text-xs" onClick={() => onAddChapter('c')}>
                    <Plus className="h-3 w-3 mr-1" />
                    添加章节
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* True Route */}
        {trueChapters.length > 0 && (
          <div className="rounded-lg border border-pink-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-pink-50/50 transition-colors" onClick={() => toggleRoute('true')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-pink-400 transition-transform", collapsedRoutes.has('true') && "-rotate-90")} />
                <span className="text-pink-500 text-sm">🎀</span>
                <span className="text-sm font-medium text-foreground">True线</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-pink-100 text-pink-600">{trueChapters.length} 章</span>
              </div>
              {onEditRoute && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditRoute('true') }}
                  className="rounded p-1 text-muted-foreground hover:bg-pink-100 hover:text-pink-600 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {!collapsedRoutes.has('true') && (
              <div className="px-3 pb-2">
                <div className="space-y-2">
                  {trueChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} compact isBranching={isBranching} displayNumber={commonChapters.length + idx + 1} />
                  ))}
                </div>
                {onAddChapter && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-pink-600 hover:bg-pink-50 h-7 text-xs" onClick={() => onAddChapter('true')}>
                    <Plus className="h-3 w-3 mr-1" />
                    添加章节
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Add Route Button - Show when branching structure or already has branches */}
        {(isBranching || hasBranches) && (
          <div
            onClick={() => onOpenAddRouteDialog?.()}
            className="flex items-center justify-center rounded-xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50/50 to-violet-50/50 p-8 min-h-[160px] cursor-pointer hover:border-pink-400 hover:from-pink-50/80 hover:to-violet-50/80 transition-all"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-violet-100">
                <Plus className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-pink-600">添加新路线</p>
                <p className="text-xs text-muted-foreground mt-1">创建新的个人线故事</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
