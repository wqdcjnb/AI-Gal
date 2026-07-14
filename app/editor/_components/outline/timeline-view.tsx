'use client'

import type { ChapterViewProps } from '@/app/editor/_lib/types'
import { ChapterCard } from '@/app/editor/_components/outline/chapter-card'

export function TimelineView(props: ChapterViewProps) {
  const { chapters } = props

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 via-violet-200 to-pink-200" />

      <div className="space-y-6">
        {chapters.map((chapter, idx) => (
          <div key={chapter.id} className="relative">
            {/* Timeline dot */}
            <div className="absolute left-[20px] top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-violet-400 shadow-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>

            {/* Chapter card */}
            <div className="ml-14">
              <ChapterCard {...props} chapter={chapter} index={idx} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
