'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { routeLabels, endingLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { Chapter, SubSection } from '@/app/editor/_lib/types'

const PALETTE = [
  { border: 'border-blue-200',   bg: 'bg-blue-50/60',   text: 'text-blue-700',   dot: 'bg-blue-400',   number: 'bg-blue-100 text-blue-700',   numberActive: 'bg-blue-500 text-white' },
  { border: 'border-pink-200',   bg: 'bg-pink-50/60',   text: 'text-pink-700',   dot: 'bg-pink-400',   number: 'bg-pink-100 text-pink-700',   numberActive: 'bg-pink-500 text-white' },
  { border: 'border-violet-200', bg: 'bg-violet-50/60', text: 'text-violet-700', dot: 'bg-violet-400', number: 'bg-violet-100 text-violet-700', numberActive: 'bg-violet-500 text-white' },
  { border: 'border-amber-200',  bg: 'bg-amber-50/60',  text: 'text-amber-700',  dot: 'bg-amber-400',  number: 'bg-amber-100 text-amber-700',  numberActive: 'bg-amber-500 text-white' },
  { border: 'border-emerald-200',bg: 'bg-emerald-50/60',text: 'text-emerald-700',dot: 'bg-emerald-400',number: 'bg-emerald-100 text-emerald-700',numberActive: 'bg-emerald-500 text-white' },
  { border: 'border-orange-200', bg: 'bg-orange-50/60', text: 'text-orange-700', dot: 'bg-orange-400', number: 'bg-orange-100 text-orange-700', numberActive: 'bg-orange-500 text-white' },
  { border: 'border-teal-200',   bg: 'bg-teal-50/60',   text: 'text-teal-700',   dot: 'bg-teal-400',   number: 'bg-teal-100 text-teal-700',   numberActive: 'bg-teal-500 text-white' },
  { border: 'border-rose-200',   bg: 'bg-rose-50/60',   text: 'text-rose-700',   dot: 'bg-rose-400',   number: 'bg-rose-100 text-rose-700',   numberActive: 'bg-rose-500 text-white' },
]

function getRouteLabel(route: string) {
  return routeLabels[route]?.label || route
}
function getRouteEmoji(route: string) {
  return routeLabels[route]?.emoji || '📌'
}

interface ChapterSidebarProps {
  chapters: Chapter[]
  isMultiEnding: boolean
  selectedChapterId: string | null
  selectedSubSectionId: string | null
  collapsedRoutes: Set<string>
  collapsedChapters: Set<string>
  allSubSections: Record<string, SubSection[]>
  onSelectChapter: (id: string) => void
  onSubSectionClick: (chapterId: string, subSectionId: string) => void
  onToggleRoute: (route: string) => void
  onToggleChapter: (chapterId: string) => void
}

export function ChapterSidebar({
  chapters,
  isMultiEnding,
  selectedChapterId,
  selectedSubSectionId,
  collapsedRoutes,
  collapsedChapters,
  allSubSections,
  onSelectChapter,
  onSubSectionClick,
  onToggleRoute,
  onToggleChapter,
}: ChapterSidebarProps) {
  const mainChapters = chapters.filter(ch => !ch.endingType).sort((a, b) => a.number - b.number)
  const endingChapters = chapters.filter(ch => ch.endingType)

  // Dynamic route grouping
  const routeOrder = ['common']
  const routeGroups = new Map<string, Chapter[]>()
  for (const ch of mainChapters) {
    const r = ch.route || 'common'
    if (!routeGroups.has(r)) { routeGroups.set(r, []); if (!routeOrder.includes(r)) routeOrder.push(r) }
    routeGroups.get(r)!.push(ch)
  }
  const hasBranches = routeGroups.size > 1

  const routeColor: Record<string, typeof PALETTE[0]> = {}
  routeOrder.forEach((r, i) => { routeColor[r] = PALETTE[i % PALETTE.length] })

  const commonCount = (routeGroups.get('common') || []).length

  return (
    <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="border-b border-border px-3 py-2.5 shrink-0">
        <h3 className="text-sm font-medium text-foreground">章节列表</h3>
      </div>
      <div className="overflow-y-auto flex-1 px-2 py-2 space-y-4">
        {hasBranches ? (
          <div className="space-y-3">
            {routeOrder.map((route) => {
              const rChapters = routeGroups.get(route)
              if (!rChapters || rChapters.length === 0) return null
              const rc = routeColor[route]
              const isCollapsed = collapsedRoutes.has(route)
              return (
                <div key={route} className={cn('rounded-xl border overflow-hidden', rc.border)}>
                  <button
                    onClick={() => onToggleRoute(route)}
                    className={cn('w-full flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer', rc.bg)}
                  >
                    <ChevronDown className={cn('h-3 w-3 transition-transform shrink-0', rc.text, isCollapsed && '-rotate-90')} />
                    <span className="text-xs shrink-0">{getRouteEmoji(route)}</span>
                    <span className={cn('text-xs font-semibold', rc.text)}>{getRouteLabel(route)}</span>
                    <span className={cn('ml-auto text-[10px] rounded-full px-1.5 py-0.5', rc.number)}>{rChapters.length} 章</span>
                  </button>
                  {!isCollapsed && (
                    <div className="px-2 pb-2 space-y-0.5">
                      {rChapters.map((chapter, ci) => {
                        const isSelected = selectedChapterId === chapter.id
                        const dispNum = route === 'common' ? ci + 1 : commonCount + ci + 1
                        return (
                          <ChapterItem
                            key={chapter.id}
                            chapter={chapter}
                            isSelected={isSelected}
                            isExpanded={!collapsedChapters.has(chapter.id)}
                            dispNum={dispNum}
                            rc={rc}
                            subSections={allSubSections[chapter.id] || []}
                            selectedSubSectionId={selectedSubSectionId}
                            onSelect={() => onSelectChapter(chapter.id)}
                            onToggle={() => onToggleChapter(chapter.id)}
                            onSubClick={(subId) => onSubSectionClick(chapter.id, subId)}
                          />
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            {endingChapters.length > 0 && <EndingSeparator />}
          </div>
        ) : (
          <div className="space-y-0.5">
            {mainChapters.map((chapter, mi) => {
              const isSelected = selectedChapterId === chapter.id
              return (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isSelected={isSelected}
                  isExpanded={!collapsedChapters.has(chapter.id)}
                  dispNum={mi + 1}
                  subSections={allSubSections[chapter.id] || []}
                  selectedSubSectionId={selectedSubSectionId}
                  onSelect={() => onSelectChapter(chapter.id)}
                  onToggle={() => onToggleChapter(chapter.id)}
                  onSubClick={(subId) => onSubSectionClick(chapter.id, subId)}
                />
              )
            })}
          </div>
        )}

        {endingChapters.length > 0 && !hasBranches && <EndingSeparator />}
        {endingChapters.length > 0 && !hasBranches && (
          <div className="space-y-1">
            {endingChapters.map((chapter, idx) => {
              const isSelected = selectedChapterId === chapter.id
              const endingConfig = endingLabels[chapter.endingType || 'GE']
              const dispNum = mainChapters.length + idx + 1
              return (
                <button
                  key={chapter.id}
                  onClick={() => onSelectChapter(chapter.id)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-left transition-all border',
                    isSelected ? 'bg-amber-50 border-amber-300 shadow-sm' : 'border-amber-100/40 hover:bg-amber-50/30'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base shrink-0">{endingConfig?.emoji || '🎭'}</span>
                    <span className="text-xs text-amber-500 font-medium w-5 shrink-0">{toChineseNumber(dispNum)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{chapter.title}</span>
                        {endingConfig && (
                          <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium', endingConfig.color)}>
                            {endingConfig.label}
                          </span>
                        )}
                      </div>
                      {chapter.summary && (
                        <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/60">{chapter.summary}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Single chapter item ──
function ChapterItem({
  chapter, isSelected, isExpanded, dispNum, rc, subSections, selectedSubSectionId,
  onSelect, onToggle, onSubClick,
}: {
  chapter: Chapter
  isSelected: boolean
  isExpanded: boolean
  dispNum: number
  rc?: typeof PALETTE[0]
  subSections: SubSection[]
  selectedSubSectionId: string | null
  onSelect: () => void
  onToggle: () => void
  onSubClick: (subId: string) => void
}) {
  const defaultStyle = { border: 'border-pink-200', bg: 'bg-pink-50', text: 'text-pink-400', dot: 'bg-pink-300', number: 'bg-gradient-to-br from-pink-100 to-violet-100 text-pink-700', numberActive: 'bg-gradient-to-br from-pink-400 to-violet-400 text-white' }
  const s = rc || defaultStyle

  return (
    <div>
      <button
        onClick={onSelect}
        className={cn(
          'w-full rounded-lg px-3 py-2.5 text-left transition-all border',
          isSelected
            ? rc ? cn('shadow-sm', s.bg, s.border) : 'bg-pink-50 border-pink-200 shadow-sm'
            : 'border-transparent hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className={cn('p-0.5 rounded cursor-pointer transition-transform', isExpanded ? '' : '-rotate-90', rc ? s.text : 'text-pink-400')}
            role="button" tabIndex={0}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
          <span className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold',
            isSelected ? (rc ? s.numberActive : 'bg-gradient-to-br from-pink-400 to-violet-400 text-white shadow-sm') : (rc ? s.number : 'bg-gradient-to-br from-pink-100 to-violet-100 text-pink-700')
          )}>
            {toChineseNumber(dispNum)}
          </span>
          <div className="min-w-0 flex-1">
            <span className="truncate text-sm font-medium text-foreground">{chapter.title}</span>
          </div>
        </div>
      </button>
      {isExpanded && subSections.length > 0 && (
        <div className="ml-10 mt-0.5 mb-1 space-y-0.5">
          {subSections.map((sub) => {
            const isSubSelected = selectedSubSectionId === sub.id
            return (
              <button
                key={sub.id}
                onClick={(e) => { e.stopPropagation(); onSubClick(sub.id) }}
                className={cn(
                  'w-full flex items-center gap-1.5 text-left rounded-md px-2 py-1 transition-all text-[10px] border',
                  isSubSelected
                    ? 'bg-white border-pink-200 shadow-sm text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                )}
              >
                <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', isSubSelected ? 'bg-pink-400' : (rc ? s.dot : 'bg-pink-300'))} />
                <span className="truncate">{sub.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EndingSeparator() {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-200" />
      <span className="text-[10px] font-medium text-amber-500 tracking-wide">结局</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-200" />
    </div>
  )
}
