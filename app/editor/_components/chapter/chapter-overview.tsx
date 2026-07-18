'use client'

import { ArrowLeft, MessageSquare } from 'lucide-react'
import { toChineseNumber } from '@/app/editor/_lib/utils'
import type { SubSection } from '@/app/editor/_lib/types'
import { SubSectionCard } from './subsection-card'

// ── Chapter Overview: sub-section preview cards ──
export function ChapterOverview({
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
        {chapter.summary ? (
          <p className="mt-1 text-sm text-muted-foreground">{chapter.summary}</p>
        ) : null}
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
export function SubSectionEditor({
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
