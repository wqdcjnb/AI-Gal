'use client'

import { useState, useMemo, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'
import { useProjectStore } from '@/lib/state/project-store-zustand'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { SubSection } from '@/app/editor/_lib/types'
import { ChapterSidebar } from '@/app/editor/_components/chapter/chapter-sidebar'
import { ChapterOverview, SubSectionEditor } from '@/app/editor/_components/chapter/chapter-overview'

export default function ChapterPage() {
  const { project } = useProject()
  const storeSubSections = useProjectStore(s => s.subSections)
  const saveSubSections = useProjectStore(s => s.saveSubSections)

  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    project?.chapters && project.chapters.length > 0 ? project.chapters[0].id : null
  )
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null)
  const [selectedSubSectionId, setSelectedSubSectionId] = useState<string | null>(null)
  const [collapsedRoutes, setCollapsedRoutes] = useState<Set<string>>(new Set())
  const [collapsedChapters, setCollapsedChapters] = useState<Set<string>>(new Set())

  // Skeleton subsections from keyPoints (provides id + title structure)
  const baseSubSections = useMemo(() => {
    if (!project) return {} as Record<string, SubSection[]>
    const map: Record<string, SubSection[]> = {}
    project.chapters.forEach(ch => {
      map[ch.id] = (ch.keyPoints || []).map((kp) => ({
        id: kp.id,
        title: kp.text,
        dialogues: [] as any[],
        triggers: [] as any[],
      }))
    })
    return map
  }, [project?.chapters])

  // Merge base skeleton + saved data from store → full subsections
  // 按 ID 匹配，不依赖数组位置顺序
  const allSubSections = useMemo(() => {
    const merged: Record<string, SubSection[]> = {}
    for (const chId of Object.keys(baseSubSections)) {
      const base = baseSubSections[chId]
      const saved = storeSubSections[chId]
      if (!saved || saved.length === 0) {
        merged[chId] = base
      } else {
        // 以 base 为准构建列表，从 saved 中按 id 查找对应的对话数据
        const savedMap = new Map(saved.map(s => [s.id, s]))
        merged[chId] = base.map(bs => {
          const ss = savedMap.get(bs.id)
          return ss ? {
            ...bs,
            dialogues: ss.dialogues || [],
            triggers: ss.triggers || [],
          } : bs
        })
        // 追加 base 中没有但 saved 中有的小节（如手动添加的）
        for (const ss of saved) {
          if (!base.find(bs => bs.id === ss.id)) {
            merged[chId].push(ss)
          }
        }
      }
    }
    return merged
  }, [baseSubSections, storeSubSections])

  const subSections = selectedChapterId
    ? (allSubSections[selectedChapterId] || [])
    : []

  // Update a subsection → writes to Zustand store → IndexedDB (instant) + debounce sync to server
  const handleUpdateSubSection = useCallback((updated: SubSection) => {
    const chId = selectedChapterId
    if (!chId) return
    const list = allSubSections[chId] || []
    const updatedList = list.map(ss => ss.id === updated.id ? updated : ss)
    saveSubSections({ ...storeSubSections, [chId]: updatedList })
  }, [selectedChapterId, allSubSections, storeSubSections, saveSubSections])

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
              chapterId={selectedChapter.id}
              allSubSections={(() => {
                const mainChapters = (project?.chapters || []).filter(c => !c.endingType)
                const endingChapters = (project?.chapters || []).filter(c => c.endingType)
                const tree: { value: string; label: string; children?: { value: string; label: string; children?: { value: string; label: string }[] }[] }[] = []

                // 主线
                if (mainChapters.length > 0) {
                  tree.push({
                    value: 'main',
                    label: '主线故事',
                    children: mainChapters.map(ch => ({
                      value: ch.id,
                      label: `第${toChineseNumber(ch.number)}章`,
                      children: (allSubSections[ch.id] || []).map(s => ({ value: s.id, label: s.title })),
                    })),
                  })
                }

                // 结局
                const endingRoutes = new Map<string, { route: string; chapters: typeof mainChapters; label: string }>()
                for (const ch of endingChapters) {
                  const key = ch.route || ch.endingType || '结局'
                  if (!endingRoutes.has(key)) endingRoutes.set(key, { route: key, chapters: [], label: key })
                  endingRoutes.get(key)!.chapters.push(ch)
                }
                const mainCount = mainChapters.length
                for (const [, group] of endingRoutes) {
                  tree.push({
                    value: group.route,
                    label: group.label,
                    children: group.chapters.map((ch, i) => ({
                      value: ch.id,
                      label: `第${toChineseNumber(mainCount + i + 1)}章`,
                      children: (allSubSections[ch.id] || []).map(s => ({ value: s.id, label: s.title })),
                    })),
                  })
                }

                return tree
              })()}
              onBack={() => setSelectedSubSectionId(null)}
              onUpdate={handleUpdateSubSection}
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
