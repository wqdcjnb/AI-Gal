'use client'

import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Download, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { tabs } from '@/app/editor/_lib/constants'
import { DeleteConfirmationDialogs } from '@/app/editor/_components/shared/delete-confirmation-dialogs'
import { UndoToasts } from '@/app/editor/_components/shared/undo-toasts'

export function EditorLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { project, projectId, showSaved } = useProject()

  if (!project) return null

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/preview?id=${projectId}`)}
              className="flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-pink-300 hover:shadow-sm"
            >
              <Play className="h-4 w-4" />
              预览
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg hover:shadow-pink-300/50">
              <Download className="h-4 w-4" />
              导出
            </button>
          </div>
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
