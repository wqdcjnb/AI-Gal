'use client'

import { useState, useEffect, useMemo } from 'react'
import { BookOpen } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'
import { toChineseNumber, generateMockSubSections } from '@/app/editor/_lib/utils'
import type { SubSection } from '@/app/editor/_lib/types'
import { ChapterSidebar } from '@/app/editor/_components/chapter/chapter-sidebar'
import { ChapterOverview, SubSectionEditor } from '@/app/editor/_components/chapter/chapter-overview'

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

  const toggleRoute = (route: string) => {
    setCollapsedRoutes(prev => {
      const next = new Set(prev)
      if (next.has(route)) next.delete(route)
      else next.add(route)
      return next
    })
  }

  const handleSubSectionClick = (chapterId: string, subSectionId: string) => {
    setSelectedChapterId(chapterId)
    setExpandedSubSection(subSectionId)
    setSelectedSubSectionId(subSectionId)
  }

  const selectChapter = (id: string) => {
    setSelectedChapterId(id)
    setSelectedSubSectionId(null)
  }

  // Sync center panel sub-sections from pre-generated map
  useEffect(() => {
    if (selectedChapterId && allSubSections[selectedChapterId]) {
      setSubSections(allSubSections[selectedChapterId])
    }
  }, [selectedChapterId, allSubSections])

  if (!project) return null

  const selectedChapter = project.chapters.find(c => c.id === selectedChapterId)
  const isMultiEnding = project.narrativeStructure === '多结局'

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
      <ChapterSidebar
        chapters={project.chapters}
        isMultiEnding={isMultiEnding}
        selectedChapterId={selectedChapterId}
        selectedSubSectionId={selectedSubSectionId}
        collapsedRoutes={collapsedRoutes}
        collapsedChapters={collapsedChapters}
        allSubSections={allSubSections}
        onSelectChapter={selectChapter}
        onSubSectionClick={handleSubSectionClick}
        onToggleRoute={toggleRoute}
        onToggleChapter={toggleChapter}
      />

      {/* Center Panel */}
      <div className="flex-1 overflow-y-auto bg-background p-6">
        {selectedChapter ? (
          selectedSubSectionId ? (
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
