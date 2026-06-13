"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Ban, CheckCircle, MoreHorizontal } from "lucide-react"

const mockUsers = [
  { id: "u-1", email: "creator1@qq.com", projects: 12, exports: 8, joined: "2026-03-15", status: "active" },
  { id: "u-2", email: "creator2@163.com", projects: 5, exports: 3, joined: "2026-04-20", status: "active" },
  { id: "u-3", email: "creator3@gmail.com", projects: 24, exports: 18, joined: "2026-01-10", status: "active" },
  { id: "u-4", email: "baduser@temp.com", projects: 1, exports: 0, joined: "2026-06-01", status: "banned" },
  { id: "u-5", email: "newuser@outlook.com", projects: 3, exports: 1, joined: "2026-05-28", status: "active" },
]

export default function UsersPage() {
  const [search, setSearch] = useState("")

  const filtered = mockUsers.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
        <p className="text-muted-foreground mt-1">查看和管理所有注册用户</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">用户列表 ({mockUsers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索邮箱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">邮箱</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">项目数</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">导出数</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">注册时间</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{user.email}</td>
                    <td className="py-3 px-2 text-muted-foreground">{user.projects}</td>
                    <td className="py-3 px-2 text-muted-foreground">{user.exports}</td>
                    <td className="py-3 px-2 text-muted-foreground">{user.joined}</td>
                    <td className="py-3 px-2">
                      {user.status === "active" ? (
                        <Badge className="text-[10px] bg-green-500/10 text-green-600 border-none">
                          正常
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-red-500/10 text-red-600 border-none">
                          已封禁
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {user.status === "active" ? (
                          <Button variant="ghost" size="sm" className="text-xs text-red-500 h-7">
                            <Ban className="h-3 w-3 mr-1" /> 封禁
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-xs text-green-500 h-7">
                            <CheckCircle className="h-3 w-3 mr-1" /> 解封
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
