"use client"

import { useAuth } from "@/components/auth-provider"
import { useProject } from "@/components/project/project-context"
import {
  FolderOpen,
  UserRound,
  Download,
  Plus,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const stats = [
  {
    label: "我的项目",
    value: "0",
    icon: FolderOpen,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    label: "角色总数",
    value: "0",
    icon: UserRound,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    label: "导出次数",
    value: "0",
    icon: Download,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    label: "作品收藏",
    value: "0",
    icon: Sparkles,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const { projects } = useProject()

  const recentProjects = projects
    .filter((p) => !p.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          欢迎回来{user?.email ? `，${user.email.split("@")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          AI 驱动的 Galgame 制作平台 · 零代码可视化创作
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition-shadow"
          >
            <div
              className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}
            >
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          快速操作
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              label: "新建项目",
              desc: "创建一个全新的 Galgame 项目",
              href: "/dashboard/projects/new",
              primary: true,
            },
            {
              label: "我的项目",
              desc: "查看和管理所有项目",
              href: "/dashboard/projects",
            },
            {
              label: "作品广场",
              desc: "浏览社区公开作品",
              href: "/gallery",
            },
            {
              label: "帮助教程",
              desc: "学习如何使用 AI-Gal",
              href: "/help",
            },
            {
              label: "个人中心",
              desc: "修改个人信息和密码",
              href: "/dashboard/profile",
            },
            {
              label: "导出记录",
              desc: "查看历史导出记录",
              href: "/dashboard/projects",
            },
          ].map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={`text-left p-3 rounded-lg border transition-colors group ${
                action.primary
                  ? "border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10"
                  : "border-border hover:bg-accent"
              }`}
            >
              <p className="text-sm font-medium flex items-center gap-1.5">
                {action.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all" />
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {action.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />
            最近项目
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">
              查看全部 <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">还没有任何项目</p>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
              <Link href="/dashboard/projects/new">
                <Plus className="h-4 w-4" />
                创建第一个项目
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.category} · {project.storyLength} · 更新于{" "}
                    {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  步骤 {project.currentStep}/6
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
