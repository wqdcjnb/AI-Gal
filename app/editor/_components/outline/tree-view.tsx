'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Edit3, GitBranch, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChapterCard } from '@/app/editor/_components/outline/chapter-card'
import type { TreeViewProps, Chapter } from '@/app/editor/_lib/types'

const rainbowColors = [
  { border: 'border-red-200', bg: 'bg-red-50/60', text: 'text-red-700', number: 'bg-red-100 text-red-700', tailwind: 'red' },
  { border: 'border-orange-200', bg: 'bg-orange-50/60', text: 'text-orange-700', number: 'bg-orange-100 text-orange-700', tailwind: 'orange' },
  { border: 'border-yellow-200', bg: 'bg-yellow-50/60', text: 'text-yellow-700', number: 'bg-yellow-100 text-yellow-700', tailwind: 'yellow' },
  { border: 'border-green-200', bg: 'bg-green-50/60', text: 'text-green-700', number: 'bg-green-100 text-green-700', tailwind: 'green' },
  { border: 'border-cyan-200', bg: 'bg-cyan-50/60', text: 'text-cyan-700', number: 'bg-cyan-100 text-cyan-700', tailwind: 'cyan' },
  { border: 'border-blue-200', bg: 'bg-blue-50/60', text: 'text-blue-700', number: 'bg-blue-100 text-blue-700', tailwind: 'blue' },
  { border: 'border-violet-200', bg: 'bg-violet-50/60', text: 'text-violet-700', number: 'bg-violet-100 text-violet-700', tailwind: 'violet' },
]

const endingColorMap: Record<string, number> = { 'Good End': 3, 'Normal End': 5, 'Bad End': 0, 'True End': 6 } // green/blue/red/violet

export function TreeView({
  chapters,
  isBranching,
  isMultiEnding = false,
  onAddChapter,
  onOpenAddRouteDialog,
  onEditRoute,
  ...props
}: TreeViewProps) {
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(new Set())

  const toggleRoute = (route: string) => {
    const next = new Set(collapsedRoutes)
    if (next.has(route)) next.delete(route); else next.add(route)
    setCollapsedRoutes(next)
  }

  const commonChapters = chapters.filter(ch => ch.route === 'common')
  const routeGroups = new Map<string, Chapter[]>()
  chapters.filter(ch => ch.route && ch.route !== 'common').forEach(ch => {
    const key = ch.route!
    if (!routeGroups.has(key)) routeGroups.set(key, [])
    routeGroups.get(key)!.push(ch)
  })
  const hasBranches = routeGroups.size > 0
  const routeEntries = Array.from(routeGroups.entries())

  const getColor = (idx: number, routeKey: string) => {
    if (isMultiEnding) {
      // Find the ending type from chapters in this route
      const chs = routeGroups.get(routeKey) || []
      const endingType = chs[0]?.endingType
      if (endingType && endingColorMap[endingType] !== undefined) {
        return rainbowColors[endingColorMap[endingType]]
      }
    }
    return rainbowColors[idx % rainbowColors.length]
  }

  const T = {
    commonLabel: isMultiEnding ? '主线故事' : '共通线',
    commonDesc: isMultiEnding ? '共同经历的故事主线' : '所有玩家都会经历的故事内容',
    addCommon: isMultiEnding ? '添加主线章节' : '添加共通线章节',
    branchPoint: isMultiEnding ? '结局选择' : '分支选择点',
    routesHeader: isMultiEnding ? '🏁 结局分支' : '🎀 个人线',
    routesDesc: isMultiEnding ? '不同的故事终点' : '根据选择进入不同角色的故事线',
    addRoute: isMultiEnding ? '添加结局' : '添加新路线',
    addRouteDesc: isMultiEnding ? '创建新的不同结局' : '创建新的个人线故事',
    routeNames: {} as Record<string, string>,
    routeEmojis: isMultiEnding ? { 'Good End': '🌸', 'Normal End': '📘', 'Bad End': '💀', 'True End': '👑' } as Record<string, string> : {} as Record<string, string>,
  }

  return (
    <div className="space-y-6">
      {/* Common Route */}
      {commonChapters.length > 0 && (
        <div>
          <div className="rounded-lg border border-blue-200 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-blue-50/50 transition-colors" onClick={() => toggleRoute('common')}>
              <div className="flex items-center gap-2">
                <ChevronDown className={cn("h-3 w-3 text-blue-400 transition-transform", collapsedRoutes.has('common') && "-rotate-90")} />
                <span className="text-blue-500 text-sm">📖</span>
                <span className="text-sm font-medium text-foreground">{T.commonLabel}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">{commonChapters.length} 章</span>
              </div>
            </div>
            {!collapsedRoutes.has('common') && (
              <div className="px-3 pb-3">
                <div className="mb-3 rounded-lg border-l-4 border-blue-400 bg-blue-50/50 px-4 py-2">
                  <p className="text-xs text-blue-700"><span className="font-medium">{T.commonLabel}</span> — {T.commonDesc}</p>
                </div>
                <div className="space-y-2">
                  {commonChapters.map((chapter, idx) => (
                    <ChapterCard key={chapter.id} {...props} chapter={chapter} index={idx} isBranching={isBranching} />
                  ))}
                </div>
                {onAddChapter && hasBranches && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-blue-600 hover:bg-blue-50 h-7 text-xs" onClick={() => onAddChapter('common')}>
                    <Plus className="h-3 w-3 mr-1" />{T.addCommon}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Branch Point */}
      {hasBranches && (
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 border-t border-dashed border-pink-300" />
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-1.5">
            <GitBranch className="h-4 w-4 text-pink-600" />
            <span className="text-xs font-medium text-pink-700">{T.branchPoint}</span>
          </div>
          <div className="flex-1 border-t border-dashed border-violet-300" />
        </div>
      )}

      {/* Routes Header */}
      {hasBranches && (
        <div className="rounded-lg border-l-4 border-pink-400 bg-pink-50/50 px-4 py-2">
          <p className="text-xs text-pink-700"><span className="font-medium">{T.routesHeader}</span> — {T.routesDesc}</p>
        </div>
      )}

      {/* Route groups */}
      <div className="space-y-4">
        {routeEntries.map(([key, chs], idx) => {
          const rc = getColor(idx, key)
          const c = rc.tailwind
          return (
            <div key={key} className={cn("rounded-lg border overflow-hidden", rc.border)}>
              <div className={cn("flex items-center justify-between px-3 py-2 cursor-pointer transition-colors", rc.bg)} onClick={() => toggleRoute(key)}>
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn("h-3 w-3 transition-transform", rc.text, collapsedRoutes.has(key) && "-rotate-90")} />
                  {isMultiEnding && T.routeEmojis[key] ? (
                    <span className="text-sm">{T.routeEmojis[key]}</span>
                  ) : (
                    <Heart className={cn("h-4 w-4", rc.text)} fill="currentColor" />
                  )}
                  <span className={cn("text-sm font-medium text-foreground")}>{T.routeNames[key] || key}</span>
                  <span className={cn("text-xs px-1.5 py-0.5 rounded", rc.number)}>{chs.length} 章</span>
                </div>
                {onEditRoute && (
                  <button onClick={(e) => { e.stopPropagation(); onEditRoute(key) }}
                    className={cn("rounded p-1 text-muted-foreground transition-colors hover:", rc.bg, rc.text)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {!collapsedRoutes.has(key) && (
                <div className="px-3 pb-2">
                  <div className="space-y-2">
                    {chs.map((chapter, ci) => (
                      <ChapterCard key={chapter.id} {...props} chapter={chapter} index={ci} compact isBranching={isBranching} displayNumber={commonChapters.length + ci + 1}
                        cardColors={{
                          border: `border-${c}-100`,
                          shadow: `hover:shadow-${c}-100/50`,
                          numberBg: `from-${c}-100 to-${c}-200`,
                          numberText: `text-${c}-700`,
                          dot: `bg-${c}-300`,
                          hoverBg: `hover:bg-${c}-50`,
                          buttonText: `text-${c}-500 hover:text-${c}-600`,
                          focusRing: `focus:bg-${c}-50`,
                        } as any} />
                    ))}
                  </div>
                  {onAddChapter && (
                    <Button variant="ghost" size="sm" className={cn("w-full mt-2 h-7 text-xs", rc.text)} onClick={() => onAddChapter(key)}>
                      <Plus className="h-3 w-3 mr-1" />添加章节
                    </Button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* Add Route Button */}
        {(isBranching || hasBranches) && (
          <div onClick={() => onOpenAddRouteDialog?.()} className="flex items-center justify-center rounded-xl border-2 border-dashed border-pink-300 bg-gradient-to-br from-pink-50/50 to-violet-50/50 p-8 min-h-[160px] cursor-pointer hover:border-pink-400 transition-all">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-100 to-violet-100">
                <Plus className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-pink-600">{T.addRoute}</p>
                <p className="text-xs text-muted-foreground mt-1">{T.addRouteDesc}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
