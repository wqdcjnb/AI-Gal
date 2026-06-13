"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Check, type LucideIcon } from "lucide-react"
import {
  FileText,
  UserRound,
  BookOpen,
  MessageSquare,
  Image,
  Music,
  Play,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  number: number
  label: string
  shortLabel: string
  icon: LucideIcon
  href: string
}

const steps: Step[] = [
  { number: 1, label: "基础信息", shortLabel: "信息", icon: FileText, href: "" },
  { number: 2, label: "角色生成", shortLabel: "角色", icon: UserRound, href: "/characters" },
  { number: 3, label: "剧情大纲", shortLabel: "大纲", icon: BookOpen, href: "/outline" },
  { number: 4, label: "对话编辑", shortLabel: "对话", icon: MessageSquare, href: "/dialogue" },
  { number: 5, label: "背景CG", shortLabel: "背景", icon: Image, href: "/backgrounds" },
  { number: 6, label: "BGM音效", shortLabel: "BGM", icon: Music, href: "/bgm" },
]

const extraSteps: Step[] = [
  { number: 0, label: "在线预览", shortLabel: "预览", icon: Play, href: "/preview" },
  { number: 0, label: "导出", shortLabel: "导出", icon: Download, href: "/export" },
]

interface StepIndicatorProps {
  projectId: string
  currentStep?: number
}

export function StepIndicator({ projectId, currentStep = 1 }: StepIndicatorProps) {
  const pathname = usePathname()
  const basePath = `/dashboard/projects/${projectId}`

  // 检查当前活跃的步骤
  const isActive = (href: string) => {
    if (href === "" && (pathname === basePath || pathname === `${basePath}/`)) return true
    return pathname.startsWith(`${basePath}${href}`) && href !== ""
  }

  const isCompleted = (stepNumber: number) => {
    return stepNumber < currentStep
  }

  return (
    <nav className="w-full overflow-x-auto">
      <div className="flex items-center gap-0 min-w-max">
        {/* 6 个制作步骤 */}
        {steps.map((step, index) => {
          const active = isActive(step.href)
          const completed = isCompleted(step.number)
          const StepIcon = step.icon

          return (
            <div key={step.href} className="flex items-center">
              <Link
                href={`${basePath}${step.href}`}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors shrink-0",
                  active
                    ? "bg-foreground text-background font-medium"
                    : completed
                      ? "text-muted-foreground hover:text-foreground hover:bg-accent"
                      : "text-muted-foreground/60 hover:text-foreground hover:bg-accent"
                )}
              >
                {completed ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <StepIcon className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="hidden lg:inline">{step.label}</span>
                <span className="lg:hidden">{step.shortLabel}</span>
              </Link>
              {/* 连线 */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-4 h-px shrink-0",
                    isCompleted(step.number + 1)
                      ? "bg-foreground/40"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}

        {/* 分隔 */}
        <div className="w-6 shrink-0" />

        {/* 预览 & 导出 */}
        {extraSteps.map((step) => {
          const active = isActive(step.href)
          const StepIcon = step.icon

          return (
            <Link
              key={step.href}
              href={`${basePath}${step.href}`}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm transition-colors shrink-0",
                active
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <StepIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline">{step.label}</span>
              <span className="lg:hidden">{step.shortLabel}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
