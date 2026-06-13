"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useProject } from "./project-context"
import { StepIndicator } from "./step-indicator"
import { Button } from "@/components/ui/button"

interface ProjectLayoutProps {
  children: React.ReactNode
}

export function ProjectLayout({ children }: ProjectLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const { getProject, setCurrentProject, currentProject } = useProject()

  useEffect(() => {
    const project = getProject(projectId)
    if (project) {
      setCurrentProject(project)
    } else {
      // 项目不存在，回退到项目列表
      router.push("/dashboard/projects")
    }
  }, [projectId, getProject, setCurrentProject, router])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 顶部：返回 + 项目名 + 步骤指示器 */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回项目列表</span>
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold tracking-tight truncate">
              {currentProject.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {currentProject.category} · {currentProject.storyLength}
            </p>
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="border-b border-border pb-1">
          <StepIndicator
            projectId={projectId}
            currentStep={currentProject.currentStep}
          />
        </div>
      </div>

      {/* 内容区 */}
      <div className="min-h-[60vh]">{children}</div>
    </div>
  )
}
