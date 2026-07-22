'use client'

import { Download } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'

export default function ExportPage() {
  const { project } = useProject()
  if (!project) return null

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 mx-auto mb-4">
          <Download className="h-8 w-8 text-violet-400" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">导出</h3>
        <p className="text-sm text-muted-foreground">项目导出功能即将上线</p>
      </div>
    </div>
  )
}
