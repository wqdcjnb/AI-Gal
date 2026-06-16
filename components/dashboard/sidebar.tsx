"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useProject } from "@/components/project/project-context"
import { cn } from "@/lib/utils"
import { Clock, Pin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()
  const { projects } = useProject()

  const recentProjects = [...projects.filter((p) => !p.isArchived)]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <nav className={cn("flex flex-col gap-4 p-4 h-full", className)}>
      {/* Logo — mobile only */}
      <Link href="/dashboard" className="flex items-center gap-2.5 md:hidden" onClick={onNavClick}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AG</span>
        </div>
        <span className="font-semibold text-sm">AI-Gal</span>
      </Link>

      {/* Mobile Nav Items */}
      <div className="md:hidden space-y-0.5">
        {[
          { label: "我的项目", href: "/dashboard/projects" },
        ].map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              pathname.startsWith(item.href)
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between px-1 mb-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3 w-3" />最近打开
          </p>
          <Link href="/dashboard/projects" className="text-[11px] text-purple-500 hover:text-purple-600">
            全部
          </Link>
        </div>
        <div className="space-y-0.5">
          {recentProjects.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 py-2">暂无项目</p>
          ) : (
            recentProjects.map((p) => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} onClick={onNavClick}
                className="block px-2 py-1.5 rounded-md text-sm hover:bg-accent transition-colors truncate">
                <span className="truncate block">{p.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  未完成 · {p.tags?.[0] || ""}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Pinned */}
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 flex items-center gap-1.5">
          <Pin className="h-3 w-3" />置顶项目
        </p>
        <p className="text-xs text-muted-foreground px-2">拖拽项目到此处置顶</p>
      </div>

      {/* New Project Button */}
      <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none w-full" size="sm">
        <Link href="/dashboard/projects/new" onClick={onNavClick}>
          <Plus className="h-4 w-4" />新建游戏
        </Link>
      </Button>
    </nav>
  )
}
