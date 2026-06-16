"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { LogOut, ChevronDown, Menu, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import ThemeToggle from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TopbarProps {
  onMenuClick: () => void
}

const navItems = [
  { label: "我的项目", href: "/dashboard/projects" },
]

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const displayName = user?.nickname || user?.email?.split("@")[0] || "User"
  const avatarLetter = displayName[0]?.toUpperCase() || "U"
  const avatarUrl = user?.avatarUrl || ""

  const isActive = (href: string) => {
    if (href === "/dashboard/projects") return pathname.startsWith("/dashboard/projects")
    return pathname.startsWith(href)
  }

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="md:hidden mr-1" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/dashboard" className="flex items-center gap-2 mr-4 shrink-0">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-[11px]">AG</span>
          </div>
          <span className="font-semibold text-sm hidden sm:block">AI-Gal</span>
        </Link>

        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                isActive(item.href)
                  ? "bg-foreground text-background font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right: Theme + User */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-7 w-7 rounded-full object-cover border border-border" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-[11px] font-semibold">
                {avatarLetter}
              </div>
            )}
            <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-3 py-2.5 border-b border-border">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors">
                  <Settings className="h-3.5 w-3.5 text-muted-foreground" />账号设置
                </Link>
                <button onClick={() => { setDropdownOpen(false); logout() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent text-red-500 transition-colors">
                  <LogOut className="h-3.5 w-3.5" />退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
