"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Loader2, LogOut, User } from "lucide-react";

export function NavClient() {
  const { user, loading, openAuth, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-pink-200/40 bg-gradient-to-r from-pink-50/80 via-white/60 to-violet-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 to-violet-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1.2 0-2.4.6-3 1.5A3 3 0 0 0 6 7.5c0 1.2.6 2.4 1.5 3L12 15l4.5-4.5c.9-.6 1.5-1.8 1.5-3A3 3 0 0 0 15 4.5C14.4 3.6 13.2 3 12 3z"/>
                <path d="M12 15v6"/>
                <path d="M9 18h6"/>
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              AI-Gal
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-pink-50 hover:text-pink-600">
              我的项目
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}

          {!loading && !user && (
            <Button onClick={openAuth} className="bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-500 hover:to-violet-500 text-white shadow-md shadow-pink-200/50">
              登录
            </Button>
          )}

          {!loading && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-pink-200/50 bg-gradient-to-br from-pink-100 to-violet-100 px-3 py-1.5 text-sm font-medium text-stone-700 transition-all hover:shadow-md hover:border-pink-300">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="头像" className="h-7 w-7 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }} />
                  ) : null}
                  <div className={cn('flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-400 text-white text-xs font-bold', user.avatarUrl ? 'hidden' : '')}>
                    {user.nickname?.[0] || user.email?.[0] || "U"}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline">
                    {user.nickname || user.email?.split("@")[0] || "用户"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-pink-100/60 shadow-lg w-48">
                <div className="px-3 py-2 border-b border-pink-50">
                  <p className="text-sm font-medium text-stone-800 truncate">{user.nickname || user.email?.split("@")[0]}</p>
                  <p className="text-xs text-stone-400 truncate">{user.email}</p>
                </div>
                <DropdownMenuItem className="cursor-pointer text-stone-700 hover:bg-pink-50 hover:text-pink-600" asChild>
                  <Link href="/dashboard/profile"><User className="mr-2 h-4 w-4" />个人中心</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
