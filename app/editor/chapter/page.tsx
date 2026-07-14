'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, Sparkles, GitBranch } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { routeLabels } from '@/app/editor/_lib/constants'
import { generateMockSubSections } from '@/app/editor/_lib/utils'
import { mockCharacters } from '@/app/editor/_lib/mock-data'
import type { SubSection } from '@/app/editor/_lib/types'
import { SubSectionCard } from '@/app/editor/_components/chapter/subsection-card'

export default function ChapterPage() {
  const { project } = useProject()

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    project?.chapters && project.chapters.length > 0 ? project.chapters[0].id : null
  )
  const [subSections, setSubSections] = useState<SubSection[]>([])
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null)

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
      <div className="w-56 shrink-0 border-r border-border bg-card">
        <div className="border-b border-border p-3">
          <h3 className="text-sm font-medium text-foreground">章节列表</h3>
        </div>
        <div className="overflow-y-auto p-2" style={{ height: 'calc(100% - 49px)' }}>
          {project.chapters.map((chapter, index) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapterId(chapter.id)}
              className={cn(
                'mb-1 w-full rounded-lg p-3 text-left transition-all',
                selectedChapterId === chapter.id
                  ? 'bg-pink-50 border border-pink-200'
                  : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                  selectedChapterId === chapter.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {chapter.title}
                </span>
              </div>
              {chapter.route && (
                <span className={cn(
                  'mt-1 ml-8 inline-block rounded px-1.5 py-0.5 text-[10px]',
                  routeLabels[chapter.route]?.color || 'bg-muted text-muted-foreground'
                )}>
                  {routeLabels[chapter.route]?.label}
                </span>
              )}
            </button>
          ))}
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
