"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileCheck,
  Settings,
  BarChart3,
  Shield,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminNavItem {
  label: string
  href: string
  icon: LucideIcon
}

const adminNavItems: AdminNavItem[] = [
  { label: "管理概览", href: "/admin", icon: LayoutDashboard },
  { label: "用户管理", href: "/admin/users", icon: Users },
  { label: "作品审核", href: "/admin/works", icon: FileCheck },
  { label: "AI接口配置", href: "/admin/ai-config", icon: Settings },
  { label: "数据统计", href: "/admin/stats", icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Admin Sidebar */}
      <aside className="w-56 border-r border-border bg-muted/30 flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-sm">AI-Gal</span>
              <span className="block text-[10px] text-muted-foreground">管理后台</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
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
        </nav>

        <div className="p-3 border-t border-border">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            返回控制台
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="h-14 border-b border-border bg-background flex items-center px-6 sticky top-0 z-10">
          <h2 className="text-sm font-semibold text-muted-foreground">管理员控制台</h2>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
