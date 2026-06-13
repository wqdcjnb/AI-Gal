"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { VisuallyHidden as VisuallyHiddenPrimitive } from "radix-ui"
import { Menu, LogOut } from "lucide-react"
import { Logo } from "./logo"
import { NavMenu } from "./nav-menu"
import { useAuth } from "@/components/auth-provider"

export const NavigationSheet = () => {
  const { user, loading, openAuth, logout } = useAuth()

  return (
    <Sheet>
      <VisuallyHiddenPrimitive.Root>
        <SheetTitle>导航菜单</SheetTitle>
      </VisuallyHiddenPrimitive.Root>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Logo />
        <NavMenu orientation="vertical" className="mt-12" />

        <div className="mt-8 space-y-4">
          {!loading && !user && (
            <>
              <Button
                variant="outline"
                className="w-full sm:hidden"
                onClick={openAuth}
              >
                登录
              </Button>
              <Button className="w-full xs:hidden" onClick={openAuth}>
                免费注册
              </Button>
            </>
          )}

          {!loading && user && (
            <>
              <p className="text-sm text-muted-foreground text-center truncate">
                {user.email}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-1.5" />
                退出登录
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
