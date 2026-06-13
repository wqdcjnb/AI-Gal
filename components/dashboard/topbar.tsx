"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, User, ChevronDown, Menu, FolderOpen } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import ThemeToggle from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
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

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground hidden sm:block">
          AI-Gal 控制台
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">我的项目</span>
          </Link>
        </Button>
        <ThemeToggle />

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center text-xs font-semibold">
                {avatarLetter}
              </div>
            )}
            <span className="text-sm hidden sm:block max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-muted-foreground transition-transform hidden sm:block ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border rounded-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-border">
                <p className="text-sm font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  个人中心
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    logout()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
