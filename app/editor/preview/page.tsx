'use client'

import { Play } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'

export default function PreviewPage() {
  const { project } = useProject()
  if (!project) return null

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 mx-auto mb-4">
          <Play className="h-8 w-8 text-sky-400" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">预览</h3>
        <p className="text-sm text-muted-foreground">游戏预览功能即将上线</p>
      </div>
    </div>
  )
}
