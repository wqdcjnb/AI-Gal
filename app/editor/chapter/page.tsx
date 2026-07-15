'use client'

import { useState, useEffect, useMemo } from 'react'
import { BookOpen, ChevronDown, ArrowLeft, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { routeLabels, endingLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber, generateMockSubSections } from '@/app/editor/_lib/utils'
import type { SubSection } from '@/app/editor/_lib/types'
import { SubSectionCard } from '@/app/editor/_components/chapter/subsection-card'

export default function ChapterPage() {
  const { project } = useProject()

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    project?.chapters && project.chapters.length > 0 ? project.chapters[0].id : null
  )
  const [subSections, setSubSections] = useState<SubSection[]>([])
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null)
  const [selectedSubSectionId, setSelectedSubSectionId] = useState<string | null>(null)
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(new Set())
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set())

  // Pre-generate sub-sections for ALL chapters (for sidebar display)
  const allSubSections = useMemo(() => {
    if (!project) return {} as Record<string, SubSection[]>
    const map: Record<string, SubSection[]> = {}
    project.chapters.forEach(ch => {
      map[ch.id] = generateMockSubSections(ch)
    })
    return map
  }, [project])

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters(prev => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  // Click a sub-section in sidebar → select chapter + that sub-section
  const handleSubSectionClick = (chapterId: string, subSectionId: string) => {
    setSelectedChapterId(chapterId)
    setExpandedSubSection(subSectionId)
    setSelectedSubSectionId(subSectionId)
  }

  // Sync center panel sub-sections from pre-generated map
  useEffect(() => {
    if (selectedChapterId && allSubSections[selectedChapterId]) {
      setSubSections(allSubSections[selectedChapterId])
    }
  }, [selectedChapterId, allSubSections])

  if (!project) return null

  const selectedChapter = project.chapters.find(c => c.id === selectedChapterId)

  // Split chapters: main vs ending (multi-ending mode)
  const mainChapters = project.chapters.filter(ch => !ch.endingType)
  const endingChapters = project.chapters.filter(ch => ch.endingType)
  const isMultiEnding = project.narrativeStructure === '多结局'

  // Route grouping for branching narrative
  const commonChapters = mainChapters.filter(ch => ch.route === 'common')
  const routeAChapters = mainChapters.filter(ch => ch.route === 'a')
  const routeBChapters = mainChapters.filter(ch => ch.route === 'b')
  const routeCChapters = mainChapters.filter(ch => ch.route === 'c')
  const trueChapters = mainChapters.filter(ch => ch.route === 'true')
  const hasBranches = routeAChapters.length > 0 || routeBChapters.length > 0 || routeCChapters.length > 0 || trueChapters.length > 0

  const toggleRoute = (route: string) => {
    setCollapsedRoutes(prev => {
      const next = new Set(prev)
      if (next.has(route)) next.delete(route)
      else next.add(route)
      return next
    })
  }

  // Color config per route
  const routeColor: Record<string, { border: string; bg: string; text: string; dot: string; number: string; numberActive: string }> = {
    common:  { border: 'border-blue-200',   bg: 'bg-blue-50/60',   text: 'text-blue-700',   dot: 'bg-blue-400',   number: 'bg-blue-100 text-blue-700',   numberActive: 'bg-blue-500 text-white' },
    a:       { border: 'border-pink-200',   bg: 'bg-pink-50/60',   text: 'text-pink-700',   dot: 'bg-pink-400',   number: 'bg-pink-100 text-pink-700',   numberActive: 'bg-pink-500 text-white' },
    b:       { border: 'border-violet-200', bg: 'bg-violet-50/60', text: 'text-violet-700', dot: 'bg-violet-400', number: 'bg-violet-100 text-violet-700', numberActive: 'bg-violet-500 text-white' },
    c:       { border: 'border-amber-200',  bg: 'bg-amber-50/60',  text: 'text-amber-700',  dot: 'bg-amber-400',  number: 'bg-amber-100 text-amber-700',  numberActive: 'bg-amber-500 text-white' },
    true:    { border: 'border-emerald-200',bg: 'bg-emerald-50/60',text: 'text-emerald-700',dot: 'bg-emerald-400',number: 'bg-emerald-100 text-emerald-700',numberActive: 'bg-emerald-500 text-white' },
  }

  // Route display names
  const routeName: Record<string, string> = {
    common: '共通线', a: 'A 线', b: 'B 线', c: 'C 线', true: 'True 线',
  }

  // Route emoji
  const routeEmoji: Record<string, string> = {
    common: '📖', a: '🎀', b: '🎀', c: '🎀', true: '👑',
  }

  if (project.chapters.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-4 text-muted-foreground">请先生成大纲</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Chapter List */}
      <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="border-b border-border px-3 py-2.5 shrink-0">
          <h3 className="text-sm font-medium text-foreground">章节列表</h3>
        </div>
        <div className="overflow-y-auto flex-1 px-2 py-2 space-y-4">
          {/* ── Branching mode: route groups ── */}
          {hasBranches ? (
            <div className="space-y-3">
              {([
                { key: 'common', chapters: commonChapters },
                { key: 'a', chapters: routeAChapters },
                { key: 'b', chapters: routeBChapters },
                { key: 'c', chapters: routeCChapters },
                { key: 'true', chapters: trueChapters },
              ] as const).filter(g => g.chapters.length > 0).map((group, gi) => {
                const rc = routeColor[group.key]
                const isCollapsed = collapsedRoutes.has(group.key)
                return (
                  <div key={group.key} className={cn('rounded-xl border overflow-hidden', rc.border)}>
                    {/* Route header */}
                    <button
                      onClick={() => toggleRoute(group.key)}
                      className={cn('w-full flex items-center gap-2 px-3 py-2 transition-colors cursor-pointer', rc.bg)}
                    >
                      <ChevronDown className={cn('h-3 w-3 transition-transform shrink-0', rc.text, isCollapsed && '-rotate-90')} />
                      <span className="text-xs shrink-0">{routeEmoji[group.key]}</span>
                      <span className={cn('text-xs font-semibold', rc.text)}>{routeName[group.key]}</span>
                      <span className={cn('ml-auto text-[10px] rounded-full px-1.5 py-0.5', rc.number)}>{group.chapters.length} 章</span>
                    </button>
                    {/* Route chapters */}
                    {!isCollapsed && (
                      <div className="px-2 pb-2 space-y-0.5">
                        {group.chapters.map((chapter) => {
                          const isSelected = selectedChapterId === chapter.id
                          const dispNum = commonChapters.length > 0 && group.key !== 'common'
                            ? commonChapters.length + group.chapters.findIndex(ch => ch.id === chapter.id) + 1
                            : group.chapters.findIndex(ch => ch.id === chapter.id) + 1
                          const isExpanded = !collapsedChapters.has(chapter.id)
                          const chapterSubs = allSubSections[chapter.id] || []
                          return (
                            <div key={chapter.id}>
                              <button
                                onClick={() => { setSelectedChapterId(chapter.id); setSelectedSubSectionId(null) }}
                                className={cn(
                                  'w-full rounded-lg px-2.5 py-1.5 text-left transition-all border',
                                  isSelected
                                    ? cn('shadow-sm', rc.bg, rc.border)
                                    : 'border-transparent hover:bg-muted/50'
                                )}
                              >
                                <div className="flex items-center gap-1.5">
                                <span
                                    onClick={(e) => { e.stopPropagation(); toggleChapter(chapter.id) }}
                                    className={cn('p-0.5 rounded cursor-pointer transition-transform', isExpanded ? '' : '-rotate-90', rc.text)}
                                    role="button" tabIndex={0}
                                  >
                                    <ChevronDown className="h-3 w-3" />
                                </span>
                                  <span className={cn(
                                    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                                    isSelected ? rc.numberActive : rc.number
                                  )}>
                                    {toChineseNumber(dispNum)}
                                  </span>
                                  <span className="truncate text-xs font-medium text-foreground">{chapter.title}</span>
                                </div>
                              </button>
                              {/* Sub-sections */}
                              {isExpanded && chapterSubs.length > 0 && (
                                <div className="ml-7 mt-0.5 mb-1 space-y-0.5">
                                  {chapterSubs.map((sub) => {
                                    const isSubSelected = selectedSubSectionId === sub.id
                                    return (
                                      <button
                                        key={sub.id}
                                        onClick={(e) => { e.stopPropagation(); handleSubSectionClick(chapter.id, sub.id) }}
                                        className={cn(
                                          'w-full flex items-center gap-1.5 text-left rounded-md px-2 py-1 transition-all text-[10px] border',
                                          isSubSelected
                                            ? 'bg-white border-pink-200 shadow-sm text-foreground'
                                            : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                                        )}
                                      >
                                        <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', isSubSelected ? 'bg-pink-400' : rc.dot)} />
                                        <span className="truncate">{sub.title}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Branch separator before endings if any */}
              {endingChapters.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-200" />
                  <span className="text-[10px] font-medium text-amber-500 tracking-wide">结局</span>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-200" />
                </div>
              )}
            </div>
          ) : (
            /* ── Linear / Multi-ending: flat list ── */
            <div className="space-y-0.5">
              {mainChapters.map((chapter) => {
                const mainIdx = mainChapters.findIndex(ch => ch.id === chapter.id)
                const isSelected = selectedChapterId === chapter.id
                const isExpanded = !collapsedChapters.has(chapter.id)
                const chapterSubs = allSubSections[chapter.id] || []
                return (
                  <div key={chapter.id}>
                    <button
                      onClick={() => { setSelectedChapterId(chapter.id); setSelectedSubSectionId(null) }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2.5 text-left transition-all border',
                        isSelected
                          ? 'bg-pink-50 border-pink-200 shadow-sm'
                          : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          onClick={(e) => { e.stopPropagation(); toggleChapter(chapter.id) }}
                          className={cn('p-0.5 rounded cursor-pointer transition-transform', isExpanded ? '' : '-rotate-90', 'text-pink-400')}
                          role="button" tabIndex={0}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </span>
                        <span className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold',
                          isSelected
                            ? 'bg-gradient-to-br from-pink-400 to-violet-400 text-white shadow-sm'
                            : 'bg-gradient-to-br from-pink-100 to-violet-100 text-pink-700'
                        )}>
                          {toChineseNumber(mainIdx + 1)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="truncate text-sm font-medium text-foreground">{chapter.title}</span>
                        </div>
                      </div>
                    </button>
                    {/* Sub-sections */}
                    {isExpanded && chapterSubs.length > 0 && (
                      <div className="ml-10 mt-0.5 mb-1 space-y-0.5">
                        {chapterSubs.map((sub) => {
                          const isSubSelected = selectedSubSectionId === sub.id
                          return (
                            <button
                              key={sub.id}
                              onClick={(e) => { e.stopPropagation(); handleSubSectionClick(chapter.id, sub.id) }}
                              className={cn(
                                'w-full flex items-center gap-1.5 text-left rounded-md px-2 py-1 transition-all text-[10px] border',
                                isSubSelected
                                  ? 'bg-white border-pink-200 shadow-sm text-foreground'
                                  : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                              )}
                            >
                              <div className={cn('h-1.5 w-1.5 rounded-full shrink-0', isSubSelected ? 'bg-pink-400' : 'bg-pink-300')} />
                              <span className="truncate">{sub.title}</span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Ending chapters (multi-ending only) */}
          {endingChapters.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-200 to-amber-200" />
                <span className="text-[10px] font-medium text-amber-500 tracking-wide">结局</span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-200 to-amber-200" />
              </div>
              <div className="space-y-1">
                {endingChapters.map((chapter) => {
                  const isSelected = selectedChapterId === chapter.id
                  const endingConfig = endingLabels[chapter.endingType || 'GE']
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapterId(chapter.id)}
                      className={cn(
                        'w-full rounded-lg px-3 py-2.5 text-left transition-all border',
                        isSelected
                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                          : 'border-amber-100/40 hover:bg-amber-50/30'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base shrink-0">{endingConfig?.emoji || '🎭'}</span>
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
            </>
          )}
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 overflow-y-auto bg-background p-6">
        {selectedChapter ? (
          selectedSubSectionId ? (
            /* ── Sub-section Editor Mode ── */
            <SubSectionEditor
              subSection={subSections.find(ss => ss.id === selectedSubSectionId)!}
              allSubSections={Object.entries(allSubSections).map(([chId, subs]) => {
                const ch = project?.chapters.find(c => c.id === chId)
                return {
                  value: chId,
                  label: ch ? `第${toChineseNumber(ch.number)}章 ${ch.title}` : chId,
                  children: subs.map(s => ({ value: s.id, label: s.title })),
                }
              })}
              onBack={() => setSelectedSubSectionId(null)}
              onUpdate={(updated) => {
                setSubSections(prev => prev.map(ss => ss.id === updated.id ? updated : ss))
              }}
            />
          ) : (
            /* ── Chapter Overview Mode ── */
            <ChapterOverview
              chapter={selectedChapter}
              subSections={subSections}
              onSubSectionClick={(subId) => handleSubSectionClick(selectedChapter.id, subId)}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">请选择一个章节</p>
          </div>
        )}
      </div>

    </div>
  )
}

// ── Chapter Overview: sub-section preview cards ──
function ChapterOverview({
  chapter,
  subSections,
  onSubSectionClick,
}: {
  chapter: { title: string; summary: string }
  subSections: SubSection[]
  onSubSectionClick: (subId: string) => void
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">{chapter.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{chapter.summary}</p>
      </div>
      <div className="space-y-3">
        {subSections.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">暂无小节</p>
        ) : (
          subSections.map((ss, idx) => (
            <button
              key={ss.id}
              onClick={() => onSubSectionClick(ss.id)}
              className="w-full rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow border-border text-left"
            >
              <div className="flex items-center gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold bg-gradient-to-br from-pink-100 to-violet-100 text-pink-600">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{ss.title}</h4>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3" />
                    {ss.dialogues.length} 条对话
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Sub-section Editor: single full card, always expanded ──
function SubSectionEditor({
  subSection,
  onBack,
  onUpdate,
  allSubSections,
}: {
  subSection: SubSection | undefined
  onBack: () => void
  onUpdate: (updated: SubSection) => void
  allSubSections: { value: string; label: string; children?: { value: string; label: string }[] }[]
}) {
  if (!subSection) return null

  // Flatten for DialogueCard subSectionIds
  const flatIds = allSubSections.flatMap(ch => ch.children || [])

  return (
    <div>
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />返回章节总览
      </button>

      <SubSectionCard
        subSection={subSection}
        index={0}
        isExpanded={true}
        onToggle={() => {}}
        onUpdate={onUpdate}
        allSubSections={flatIds}
        subSectionTree={allSubSections}
      />
    </div>
  )
}
