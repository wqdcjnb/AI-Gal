"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
  onNavClick?: () => void
}

export function Sidebar({ className, onNavClick }: SidebarProps) {
  return (
    <nav className={cn("flex flex-col gap-4 p-4 h-full", className)}>
      {/* Logo — mobile only */}
      <Link href="/dashboard" className="flex items-center gap-2.5 md:hidden" onClick={onNavClick}>
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">AG</span>
        </div>
        <span className="font-semibold text-sm">AI-Gal</span>
      </Link>
    </nav>
  )
}
