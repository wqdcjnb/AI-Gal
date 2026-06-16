"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useProject } from "@/components/project/project-context"
import {
  Plus, Grid3X3, List, FolderOpen, Clock, ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type ViewMode = "card" | "list"

const CATEGORY_COLORS: Record<string, string> = {
  "校园": "from-emerald-500/20 to-teal-500/20",
  "奇幻": "from-purple-500/20 to-indigo-500/20",
  "悬疑": "from-slate-500/20 to-zinc-500/20",
  "异世界": "from-cyan-500/20 to-blue-500/20",
  "日常": "from-amber-500/20 to-yellow-500/20",
  "科幻": "from-blue-500/20 to-cyan-500/20",
  "恋爱": "from-pink-500/20 to-rose-500/20",
  "古风": "from-stone-500/20 to-amber-500/20",
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects } = useProject()
  const [viewMode, setViewMode] = useState<ViewMode>("card")

  const activeProjects = projects.filter((p) => !p.isArchived)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            我的项目
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeProjects.length} 个项目
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "card" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none" size="sm">
            <Link href="/dashboard/projects/new"><Plus className="h-4 w-4" />新建游戏</Link>
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {activeProjects.length === 0 && (
        <div className="text-center py-20 rounded-xl border border-dashed border-border">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">还没有项目</h2>
          <p className="text-muted-foreground text-sm mb-6">创建你的第一个 Galgame 项目，开始 AI 驱动的创作之旅</p>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            <Link href="/dashboard/projects/new"><Plus className="h-4 w-4" />创建第一个项目</Link>
          </Button>
        </div>
      )}

      {/* Card View */}
      {activeProjects.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeProjects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}
              className="group rounded-xl border border-border bg-card hover:shadow-md hover:border-purple-500/30 transition-all overflow-hidden">
              {/* Cover */}
              <div className={cn("h-32 bg-gradient-to-br flex items-center justify-center", CATEGORY_COLORS[(project.tags || [])[0]] || "from-purple-500/20 to-pink-500/20")}>
                {project.coverUrl ? (
                  <img src={project.coverUrl} alt={project.name} className="h-full w-full object-cover" />
                ) : (
                  <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
                )}
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="font-medium text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {project.name}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {(project.tags || []).map((tag) => (
                    <span key={tag} className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{tag}</span>
                  ))}
                  <span className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{project.storyLength}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />{new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="text-[11px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-medium">
                    未完成
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {/* Create New Card */}
          <Link href="/dashboard/projects/new"
            className="rounded-xl border-2 border-dashed border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-center justify-center min-h-[240px] gap-3 group">
            <div className="h-12 w-12 rounded-full bg-muted group-hover:bg-purple-500/10 flex items-center justify-center transition-colors">
              <Plus className="h-6 w-6 text-muted-foreground group-hover:text-purple-500 transition-colors" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-purple-500 transition-colors font-medium">新建游戏</span>
          </Link>
        </div>
      )}

      {/* List View */}
      {activeProjects.length > 0 && viewMode === "list" && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] gap-4 px-4 py-2.5 bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>项目名</span>
            <span>状态</span>
            <span>角色数</span>
            <span>场景数</span>
            <span>最后编辑</span>
            <span className="text-right">操作</span>
          </div>
          {/* Rows */}
          {activeProjects.map((project) => (
            <div key={project.id}
              className="grid grid-cols-[1fr_80px_80px_80px_120px_80px] gap-4 px-4 py-3 border-t border-border hover:bg-accent transition-colors items-center">
              <Link href={`/dashboard/projects/${project.id}`} className="flex items-center gap-3 min-w-0 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0 bg-gradient-to-br", CATEGORY_COLORS[(project.tags || [])[0]] || "from-purple-500/20 to-pink-500/20")}>
                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium truncate">{project.name}</span>
              </Link>
              <span className="text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full text-center font-medium">
                未完成
              </span>
              <span className="text-xs text-muted-foreground text-center">—</span>
              <span className="text-xs text-muted-foreground text-center">—</span>
              <span className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString("zh-CN")}</span>
              <div className="text-right">
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <Link href={`/dashboard/projects/${project.id}`}><ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
