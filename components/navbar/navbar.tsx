"use client"

import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import { NavMenu } from "./nav-menu"
import { NavigationSheet } from "./navigation-sheet"
import ThemeToggle from "../theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { Loader2, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"

const Navbar = () => {
  const { user, loading, openAuth, logout } = useAuth()

  return (
    <nav className="h-16 bg-background border-b border-accent">
      <div className="h-full flex items-center justify-between max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6">
        <Logo />

        {/* Desktop Menu */}
        <NavMenu className="hidden md:block" />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* 加载中 */}
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}

          {/* 未登录 */}
          {!loading && !user && (
            <>
              <Button
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={openAuth}
              >
                登录
              </Button>
              <Button
                className="hidden xs:inline-flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                onClick={openAuth}
              >
                免费注册
              </Button>
            </>
          )}

          {/* 已登录 */}
          {!loading && user && (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">控制台</span>
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden sm:inline-block truncate max-w-[120px]">
                {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">退出</span>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <NavigationSheet />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
