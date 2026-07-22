'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { routeLabels, endingLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { Chapter, SubSection } from '@/app/editor/_lib/types'

const PALETTE = [
  { border: 'border-indigo-200', bg: 'bg-indigo-50/60', text: 'text-indigo-700', dot: 'bg-indigo-400', number: 'bg-indigo-100 text-indigo-700', numberActive: 'bg-indigo-500 text-white' },
  { border: 'border-pink-200', bg: 'bg-pink-50/60', text: 'text-pink-700', dot: 'bg-pink-400', number: 'bg-pink-100 text-pink-700', numberActive: 'bg-pink-500 text-white' },
  { border: 'border-violet-200', bg: 'bg-violet-50/60', text: 'text-violet-700', dot: 'bg-violet-400', number: 'bg-violet-100 text-violet-700', numberActive: 'bg-violet-500 text-white' },
  { border: 'border-amber-200', bg: 'bg-amber-50/60', text: 'text-amber-700', dot: 'bg-amber-400', number: 'bg-amber-100 text-amber-700', numberActive: 'bg-amber-500 text-white' },
  { border: 'border-emerald-200', bg: 'bg-emerald-50/60', text: 'text-emerald-700', dot: 'bg-emerald-400', number: 'bg-emerald-100 text-emerald-700', numberActive: 'bg-emerald-500 text-white' },
  { border: 'border-orange-200', bg: 'bg-orange-50/60', text: 'text-orange-700', dot: 'bg-orange-400', number: 'bg-orange-100 text-orange-700', numberActive: 'bg-orange-500 text-white' },
  { border: 'border-teal-200', bg: 'bg-teal-50/60', text: 'text-teal-700', dot: 'bg-teal-400', number: 'bg-teal-100 text-teal-700', numberActive: 'bg-teal-500 text-white' },
  { border: 'border-rose-200', bg: 'bg-rose-50/60', text: 'text-rose-700', dot: 'bg-rose-400', number: 'bg-rose-100 text-rose-700', numberActive: 'bg-rose-500 text-white' },
]

// 结局类型 → 统一颜色（和大纲一致）
const endingColorIndex: Record<string, number> = {
  'Good End': 4,    // emerald 绿
  'Normal End': 5,  // orange 橙 → 改为 blue
  'Bad End': 0,     // red 红
  'True End': 2,    // violet 紫
}

// 覆盖 Normal End 用蓝色
const ENDING_COLORS: Record<string, typeof PALETTE[0]> = {
  'Good End':   { border: 'border-emerald-200', bg: 'bg-emerald-50/60', text: 'text-emerald-700', dot: 'bg-emerald-400', number: 'bg-emerald-100 text-emerald-700', numberActive: 'bg-emerald-500 text-white' },
  'Normal End': { border: 'border-blue-200', bg: 'bg-blue-50/60', text: 'text-blue-700', dot: 'bg-blue-400', number: 'bg-blue-100 text-blue-700', numberActive: 'bg-blue-500 text-white' },
  'Bad End':    { border: 'border-red-200', bg: 'bg-red-50/60', text: 'text-red-700', dot: 'bg-red-400', number: 'bg-red-100 text-red-700', numberActive: 'bg-red-500 text-white' },
  'True End':   { border: 'border-violet-200', bg: 'bg-violet-50/60', text: 'text-violet-700', dot: 'bg-violet-400', number: 'bg-violet-100 text-violet-700', numberActive: 'bg-violet-500 text-white' },
}

function getRouteLabel(route: string) { return routeLabels[route]?.label || route }

interface ChapterSidebarProps {
  chapters: Chapter[]; isMultiEnding: boolean
  selectedChapterId: string | null; selectedSubSectionId: string | null
  collapsedRoutes: Set<string>; collapsedChapters: Set<string>
  allSubSections: Record<string, SubSection[]>
  onSelectChapter: (id: string) => void
  onSubSectionClick: (chapterId: string, subSectionId: string) => void
  onToggleRoute: (route: string) => void
  onToggleChapter: (chapterId: string) => void
}

export function ChapterSidebar(props: ChapterSidebarProps) {
  const { chapters, selectedChapterId, selectedSubSectionId, collapsedRoutes,
    collapsedChapters, allSubSections, onSelectChapter, onSubSectionClick,
    onToggleRoute, onToggleChapter } = props

  const sorted = [...chapters].sort((a, b) => a.number - b.number)
  const commonChapters = sorted.filter(ch => ch.route === 'common' && !ch.endingType)
  const branchChapters = sorted.filter(ch => ch.route !== 'common' && !ch.endingType)
  const endingChapters = sorted.filter(ch => ch.endingType)

  // 分组：主线 / 个人线 / 结局
  const routeOrder: string[] = []
  const branchOrder: string[] = []
  const endingOrder: string[] = []
  const routeGroups = new Map<string, Chapter[]>()
  if (commonChapters.length > 0) {
    routeGroups.set('common', commonChapters)
    routeOrder.push('common')
  }
  for (const ch of branchChapters) {
    const r = ch.route || '个人线'
    if (!routeGroups.has(r)) { routeGroups.set(r, []); branchOrder.push(r) }
    routeGroups.get(r)!.push(ch)
  }
  for (const ch of endingChapters) {
    const r = ch.route || ch.endingType || '结局'
    if (!routeGroups.has(r)) { routeGroups.set(r, []); endingOrder.push(r) }
    routeGroups.get(r)!.push(ch)
  }

  const hasBranches = branchOrder.length + endingOrder.length > 0
  const routeColor: Record<string, typeof PALETTE[0]> = {}
  routeOrder.forEach((r, i) => { routeColor[r] = PALETTE[i % PALETTE.length] })
  branchOrder.forEach((r, i) => { routeColor[r] = PALETTE[(routeOrder.length + i) % PALETTE.length] })
  endingOrder.forEach((r) => {
    const firstCh = routeGroups.get(r)?.[0]
    const endingType = firstCh?.endingType
    routeColor[r] = (endingType && ENDING_COLORS[endingType]) ? ENDING_COLORS[endingType] : PALETTE[(routeOrder.length + branchOrder.length) % PALETTE.length]
  })

  // 编号: 主线 1..N | 个人线/结局从 N+1 开始各自独立
  const chDisplayNum = new Map<string, number>()
  commonChapters.forEach((ch, i) => chDisplayNum.set(ch.id, i + 1))
  for (const route of branchOrder) {
    const rChs = routeGroups.get(route)
    if (rChs) rChs.forEach((ch, i) => chDisplayNum.set(ch.id, commonChapters.length + i + 1))
  }
  for (const route of endingOrder) {
    const rChs = routeGroups.get(route)
    if (rChs) rChs.forEach((ch, i) => chDisplayNum.set(ch.id, commonChapters.length + (branchChapters.length || 0) + i + 1))
  }

  function renderRouteGroup(route: string) {
    const rChapters = routeGroups.get(route)
    if (!rChapters?.length) return null
    const rc = routeColor[route]
    const isCollapsed = collapsedRoutes.has(route)
    const isEnding = !!rChapters[0]?.endingType
    const endingConfig = isEnding ? endingLabels[rChapters[0].endingType || 'Good End'] : null
    return (
      <div key={route} className={cn('rounded-xl border overflow-hidden', rc.border)}>
        <button onClick={() => onToggleRoute(route)}
          className={cn('w-full flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer', rc.bg)}>
          <ChevronDown className={cn('h-3 w-3 transition-transform shrink-0', rc.text, isCollapsed && '-rotate-90')} />
          {isEnding && endingConfig && <span className="text-xs shrink-0">{endingConfig.emoji}</span>}
          <span className={cn('text-xs font-semibold', rc.text)}>{getRouteLabel(route)}</span>
          <span className={cn('ml-auto text-[10px] rounded-full px-1.5 py-0.5', rc.number)}>{rChapters.length} 章</span>
        </button>
        {!isCollapsed && (
          <div className="px-2 pb-2 space-y-0.5">
            {rChapters.map((chapter) => (
              <ChapterItem key={chapter.id} chapter={chapter}
                isSelected={selectedChapterId === chapter.id}
                isExpanded={!collapsedChapters.has(chapter.id)}
                displayNum={chDisplayNum.get(chapter.id) || 0}
                subSections={allSubSections[chapter.id] || []}
                selectedSubSectionId={selectedSubSectionId}
                onSelect={() => onSelectChapter(chapter.id)}
                onToggle={() => onToggleChapter(chapter.id)}
                onSubClick={(subId) => onSubSectionClick(chapter.id, subId)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
      <div className="border-b border-border px-3 py-2.5 shrink-0">
        <h3 className="text-sm font-medium text-foreground">章节列表</h3>
      </div>
      <div className="overflow-y-auto flex-1 px-2 py-2">
        {hasBranches ? (
          <div className="space-y-3">
            {routeOrder.map(renderRouteGroup)}
            {branchOrder.length > 0 && <RouteSeparator label="个人线" />}
            {branchOrder.map(renderRouteGroup)}
            {endingOrder.length > 0 && <RouteSeparator label="结局" />}
            {endingOrder.map(renderRouteGroup)}
          </div>
        ) : (
          <div>
            <div className="space-y-0.5">
              {commonChapters.map(ch => (
                <ChapterItem key={ch.id} chapter={ch}
                  isSelected={selectedChapterId === ch.id}
                  isExpanded={!collapsedChapters.has(ch.id)}
                  displayNum={chDisplayNum.get(ch.id) || 0}
                  subSections={allSubSections[ch.id] || []}
                  selectedSubSectionId={selectedSubSectionId}
                  onSelect={() => onSelectChapter(ch.id)}
                  onToggle={() => onToggleChapter(ch.id)}
                  onSubClick={(subId) => onSubSectionClick(ch.id, subId)}
                />
              ))}
            </div>
            {branchChapters.length > 0 && <RouteSeparator label="个人线" />}
            {branchChapters.length > 0 && branchChapters.map(ch => (
              <ChapterItem key={ch.id} chapter={ch}
                isSelected={selectedChapterId === ch.id}
                isExpanded={!collapsedChapters.has(ch.id)}
                displayNum={chDisplayNum.get(ch.id) || 0}
                subSections={allSubSections[ch.id] || []}
                selectedSubSectionId={selectedSubSectionId}
                onSelect={() => onSelectChapter(ch.id)}
                onToggle={() => onToggleChapter(ch.id)}
                onSubClick={(subId) => onSubSectionClick(ch.id, subId)}
              />
            ))}
            {endingChapters.length > 0 && <RouteSeparator label="结局" />}
            {endingChapters.length > 0 && endingChapters.map(ch => (
              <ChapterItem key={ch.id} chapter={ch}
                isSelected={selectedChapterId === ch.id}
                isExpanded={!collapsedChapters.has(ch.id)}
                displayNum={chDisplayNum.get(ch.id) || 0}
                subSections={allSubSections[ch.id] || []}
                selectedSubSectionId={selectedSubSectionId}
                onSelect={() => onSelectChapter(ch.id)}
                onToggle={() => onToggleChapter(ch.id)}
                onSubClick={(subId) => onSubSectionClick(ch.id, subId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Separator ──
function RouteSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-muted-foreground/20 to-muted-foreground/20" />
      <span className="text-[10px] font-medium text-muted-foreground tracking-wide">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-muted-foreground/20 to-muted-foreground/20" />
    </div>
  )
}

// ── ChapterItem ──
function ChapterItem({ chapter, isSelected, isExpanded, subSections, selectedSubSectionId,
  onSelect, onToggle, onSubClick, displayNum,
}: {
  chapter: Chapter; isSelected: boolean; isExpanded: boolean
  subSections: SubSection[]; selectedSubSectionId: string | null
  onSelect: () => void; onToggle: () => void; onSubClick: (subId: string) => void
  displayNum?: number
}) {
  const isEnding = !!chapter.endingType
  const endingConfig = isEnding ? endingLabels[chapter.endingType || 'Good End'] : null
  const ec = (isEnding && ENDING_COLORS[chapter.endingType!]) ? ENDING_COLORS[chapter.endingType!] : null

  return (
    <div>
      <button onClick={onSelect}
        className={cn('w-full rounded-lg px-3 py-2.5 text-left transition-all border',
          isSelected
            ? ec ? `${ec.bg} ${ec.border} shadow-sm` : 'bg-pink-50 border-pink-200 shadow-sm'
            : 'border-transparent hover:bg-muted/50')}>
        <div className="flex items-center gap-2">
          <span onClick={e => { e.stopPropagation(); onToggle() }}
            className="p-0.5 rounded cursor-pointer transition-transform text-pink-400"
            style={isExpanded ? {} : { transform: 'rotate(-90deg)' }}>
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
          {isEnding && endingConfig && <span className="text-sm shrink-0">{endingConfig.emoji}</span>}
          <div className="min-w-0 flex-1">
            <span className="truncate text-sm font-medium text-foreground">
              第{toChineseNumber(displayNum || chapter.number)}章
            </span>
          </div>
        </div>
      </button>
      {isExpanded && subSections.length > 0 && (
        <div className="ml-7 mt-0.5 mb-1 space-y-0.5">
          {subSections.map(sub => {
            const isSubSelected = selectedSubSectionId === sub.id
            return (
              <button key={sub.id} onClick={e => { e.stopPropagation(); onSubClick(sub.id) }}
                className={cn('w-full flex items-center gap-1.5 text-left rounded-md px-2 py-1 transition-all text-[10px] border',
                  isSubSelected
                    ? ec ? `bg-white ${ec.border} shadow-sm text-foreground` : 'bg-white border-pink-200 shadow-sm text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground')}>
                <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', isSubSelected ? (ec ? ec.dot : 'bg-pink-400') : 'bg-pink-300')} />
                <span className="truncate">{sub.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

