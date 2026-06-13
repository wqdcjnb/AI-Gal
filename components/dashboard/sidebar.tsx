"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Globe,
  HelpCircle,
  UserCircle,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const mainNavItems: NavItem[] = [
  { label: "工作台", href: "/dashboard", icon: LayoutDashboard },
  { label: "我的项目", href: "/dashboard/projects", icon: FolderOpen },
]

const secondaryNavItems: NavItem[] = [
  { label: "作品广场", href: "/gallery", icon: Globe },
  { label: "帮助教程", href: "/help", icon: HelpCircle },
  { label: "个人中心", href: "/dashboard/profile", icon: UserCircle },
]

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const isProjectEditor = pathname.startsWith("/dashboard/projects/") && pathname !== "/dashboard/projects"

  return (
    <nav className={cn("flex flex-col gap-1 p-3 h-full", className)}>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-4 mb-4" onClick={onNavClick}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AG</span>
        </div>
        <span className="font-semibold text-sm">AI-Gal</span>
      </Link>

      {/* Main Nav Items */}
      <div className="space-y-0.5">
        {mainNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive(item.href)
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* 项目编辑器子导航 - 仅在项目内显示 */}
      {isProjectEditor && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            项目编辑
          </p>
          {[
            { label: "角色生成", href: "/characters", icon: "U" },
            { label: "剧情大纲", href: "/outline", icon: "O" },
            { label: "对话编辑", href: "/dialogue", icon: "D" },
            { label: "背景CG", href: "/backgrounds", icon: "B" },
            { label: "BGM音效", href: "/bgm", icon: "M" },
            { label: "在线预览", href: "/preview", icon: "P" },
            { label: "导出下载", href: "/export", icon: "E" },
          ].map((item) => {
            // 从 pathname 提取 project ID 构建子链接
            const parts = pathname.split("/")
            const projIndex = parts.indexOf("projects")
            if (projIndex === -1) return null
            const projectId = parts[projIndex + 1]
            if (!projectId) return null
            const subHref = `/dashboard/projects/${projectId}${item.href}`

            return (
              <Link
                key={item.href}
                href={subHref}
                onClick={onNavClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  pathname.endsWith(item.href)
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <span className="h-4 w-4 shrink-0 flex items-center justify-center text-[10px] font-bold">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}

      {/* Secondary Nav Items - pushed to bottom area */}
      <div className="mt-auto space-y-0.5 pt-4 border-t border-border">
        {secondaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive(item.href)
                ? "bg-foreground text-background font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
