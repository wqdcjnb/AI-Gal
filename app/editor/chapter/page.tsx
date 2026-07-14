'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, Sparkles, GitBranch, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { routeLabels, endingLabels } from '@/app/editor/_lib/constants'
import { toChineseNumber, generateMockSubSections } from '@/app/editor/_lib/utils'
import { mockCharacters } from '@/app/editor/_lib/mock-data'
import type { SubSection, Chapter } from '@/app/editor/_lib/types'
import { SubSectionCard } from '@/app/editor/_components/chapter/subsection-card'

export default function ChapterPage() {
  const { project } = useProject()

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    project?.chapters && project.chapters.length > 0 ? project.chapters[0].id : null
  )
  const [subSections, setSubSections] = useState<SubSection[]>([])
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null)
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(new Set())

  // Generate mock sub-sections when chapter changes
  useEffect(() => {
    const chapter = project?.chapters.find(c => c.id === selectedChapterId)
    if (chapter) {
      const mockSubSections = generateMockSubSections(chapter)
      setSubSections(mockSubSections)
      setExpandedSubSection(mockSubSections.length > 0 ? mockSubSections[0].id : null)
    }
  }, [selectedChapterId, project?.chapters])

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
      <div className="w-60 shrink-0 border-r border-border bg-card flex flex-col">
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
                          return (
                            <button
                              key={chapter.id}
                              onClick={() => setSelectedChapterId(chapter.id)}
                              className={cn(
                                'w-full rounded-lg px-2.5 py-2 text-left transition-all border',
                                isSelected
                                  ? cn('shadow-sm', rc.bg, rc.border)
                                  : 'border-transparent hover:bg-muted/50'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  'flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold',
                                  isSelected ? rc.numberActive : rc.number
                                )}>
                                  {toChineseNumber(dispNum)}
                                </span>
                                <span className="truncate text-xs font-medium text-foreground">{chapter.title}</span>
                              </div>
                              {chapter.summary && (
                                <p className="mt-0.5 ml-7 truncate text-[10px] text-muted-foreground/60">{chapter.summary}</p>
                              )}
                            </button>
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
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2.5 text-left transition-all border',
                      isSelected
                        ? 'bg-pink-50 border-pink-200 shadow-sm'
                        : 'border-transparent hover:bg-muted/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
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
                        <div className="mt-1 flex items-center gap-1.5">
                          {chapter.route && (
                            <span className={cn('rounded px-1.5 py-0.5 text-[10px]', routeLabels[chapter.route]?.color)}>
                              {routeLabels[chapter.route]?.label}
                            </span>
                          )}
                          {chapter.summary && (
                            <span className="truncate text-[11px] text-muted-foreground/60">{chapter.summary}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
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

      {/* Center - Sub-section Editor */}
      <div className="flex-1 overflow-y-auto bg-background p-6">
        {selectedChapter ? (
          <div>
            {/* Chapter Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">{selectedChapter.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{selectedChapter.summary}</p>
            </div>

            {/* Choice Density Stats */}
            {(() => {
              const allChoices = subSections.flatMap(ss =>
                ss.dialogues.filter(d => d.type === 'choice' && d.choices).flatMap(d => d.choices || [])
              )
              const totalChoices = allChoices.length

              if (totalChoices === 0) return null

              return (
                <div className="mb-6 rounded-xl border border-border bg-gradient-to-r from-pink-50/50 via-white to-violet-50/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <GitBranch className="h-4 w-4 text-pink-500" />
                    <span className="text-sm font-medium text-foreground">选择肢统计</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {totalChoices < subSections.length * 0.5 ? '选择肢较少，接近线性阅读体验' :
                       totalChoices < subSections.length * 1.5 ? '选择肢密度适中，平衡互动与叙事' :
                       '选择肢密集，高互动性叙事'}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600">{totalChoices}</div>
                    <div className="text-xs text-muted-foreground">总选择肢</div>
                  </div>
                </div>
              )
            })()}

            {/* Sub-sections List */}
            <div className="space-y-4">
              {subSections.map((subSection, subIndex) => (
                <SubSectionCard
                  key={subSection.id}
                  subSection={subSection}
                  index={subIndex}
                  isExpanded={expandedSubSection === subSection.id}
                  onToggle={() => setExpandedSubSection(
                    expandedSubSection === subSection.id ? null : subSection.id
                  )}
                  onUpdate={(updated) => {
                    setSubSections(prev => prev.map(ss => ss.id === subSection.id ? updated : ss))
                  }}
                />
              ))}
            </div>

            {/* Add Sub-section Button */}
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground hover:border-pink-300 hover:text-pink-600 transition-colors">
              <Plus className="h-5 w-5" />
              添加小节
            </button>

            {/* AI Generate Button */}
            <div className="mt-4 flex justify-center">
              <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all">
                <Sparkles className="h-4 w-4" />
                AI 生成整章内容
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">请选择一个章节</p>
          </div>
        )}
      </div>

      {/* Right Sidebar - Character Panel */}
      <div className="w-56 shrink-0 border-l border-border bg-card">
        <div className="border-b border-border p-3">
          <h3 className="text-sm font-medium text-foreground">角色</h3>
        </div>
        <div className="p-3 space-y-2">
          {mockCharacters.map((char) => (
            <div
              key={char.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 cursor-pointer"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-medium"
                style={{ backgroundColor: char.color }}
              >
                {char.name[0]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{char.name}</p>
                <p className="text-xs text-muted-foreground">未出场</p>
              </div>
            </div>
          ))}
          <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-2 text-sm text-muted-foreground hover:border-pink-300 hover:text-pink-600">
            <Plus className="h-4 w-4" />
            添加角色
          </button>
        </div>
      </div>
    </div>
  )
}
