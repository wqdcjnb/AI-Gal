'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2, Database, Globe, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { useProjectStore } from '@/lib/state/project-store-zustand'
import { tabs } from '@/app/editor/_lib/constants'
import { DeleteConfirmationDialogs } from '@/app/editor/_components/shared/delete-confirmation-dialogs'
import { UndoToasts } from '@/app/editor/_components/shared/undo-toasts'

// ── Ready Gate: 初始化完成前的全屏加载界面 ──
function ReadyGate({ stage }: { stage: string }) {
  const steps = [
    { key: 'init',  icon: Database,  label: '读取本地缓存' },
    { key: 'cache', icon: FileText,  label: '项目数据就绪' },
    { key: 'server', icon: Globe,    label: '同步服务器' },
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-72 space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-1">
          <Loader2 className="h-6 w-6 animate-spin text-pink-400 mx-auto" />
          <p className="text-sm font-medium text-foreground">正在打开项目</p>
        </div>

        {/* 阶段指示器 */}
        <div className="space-y-1.5">
          {steps.map((s) => {
            const Icon = s.icon
            const stageOrder = ['init', 'cache', 'server']
            const currentIdx = stageOrder.indexOf(stage)
            const stepIdx = stageOrder.indexOf(s.key)
            const done = stepIdx < currentIdx
            const active = stepIdx === currentIdx

            return (
              <div key={s.key} className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                active && 'bg-pink-50 border border-pink-100',
                done && 'text-muted-foreground/50',
                !done && !active && 'text-muted-foreground/30',
              )}>
                <div className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
                  active && 'bg-pink-100 text-pink-600',
                  done && 'bg-emerald-100 text-emerald-600',
                  !done && !active && 'bg-muted text-muted-foreground/30',
                )}>
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className={cn(
                  'text-xs font-medium transition-colors',
                  active && 'text-pink-700',
                  done && 'text-emerald-700',
                  !done && !active && 'text-muted-foreground/40',
                )}>{s.label}</span>
                {active && <Loader2 className="h-3 w-3 animate-spin text-pink-400 ml-auto" />}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function EditorLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { project, projectId, projectReady } = useProject()
  const showSaved = useProjectStore(s => s.showSaved)
  const loadingStage = useProjectStore(s => s.loadingStage)

  // ── Ready Gate ──
  if (!projectReady || !project) {
    return <ReadyGate stage={loadingStage} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Toolbar */}
      <header className="sticky top-14 z-40 border-b border-pink-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="h-5 w-px bg-border" />
            <span className="text-lg font-semibold text-foreground">
              {project.name}
            </span>
            {showSaved && (
              <span className="flex items-center gap-1 text-xs text-green-600 animate-in fade-in">
                <Check className="h-3 w-3" />
                已保存
              </span>
            )}
          </div>

          {/* Center: Tabs */}
          <nav className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = pathname === `/editor/${tab.id}`
              return (
                <Link
                  key={tab.id}
                  href={`/editor/${tab.id}?id=${projectId}`}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2" />
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        pathname === '/editor/chapter' ? 'h-[calc(100vh-73px)]' : 'mx-auto max-w-5xl px-6 py-8'
      )}>
        {children}
      </main>

      {/* Global modals: Delete confirmations + Undo toasts */}
      <DeleteConfirmationDialogs />
      <UndoToasts />
    </div>
  )
}
