"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Eye, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

const mockWorks = [
  { id: "w-1", title: "深夜迷案", author: "推理爱好者", category: "悬疑", submitted: "2026-06-13", status: "pending" },
  { id: "w-2", title: "星辰之约", author: "星空旅人", category: "恋爱", submitted: "2026-06-12", status: "pending" },
  { id: "w-3", title: "魔法学院", author: "奇幻写手", category: "奇幻", submitted: "2026-06-12", status: "pending" },
  { id: "w-4", title: "夏日幻梦", author: "创作者小明", category: "校园", submitted: "2026-06-10", status: "approved" },
  { id: "w-5", title: "江南烟雨录", author: "古风写手", category: "古风", submitted: "2026-06-08", status: "approved" },
  { id: "w-6", title: "违规内容示例", author: "测试用户", category: "其他", submitted: "2026-06-11", status: "rejected" },
]

export default function WorksPage() {
  const [search, setSearch] = useState("")

  const filtered = mockWorks.filter((w) =>
    w.title.toLowerCase().includes(search.toLowerCase()) ||
    w.author.toLowerCase().includes(search.toLowerCase())
  )

  const pendingCount = mockWorks.filter((w) => w.status === "pending").length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">作品审核</h1>
          <p className="text-muted-foreground mt-1">
            审核用户公开作品，过滤违规内容
            {pendingCount > 0 && (
              <Badge className="ml-2 bg-amber-500/10 text-amber-600 border-none text-[10px]">
                {pendingCount} 待审核
              </Badge>
            )}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索作品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-8 text-xs"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">审核队列</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">作品名称</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">作者</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">分类</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">提交时间</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">状态</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((work) => (
                  <tr key={work.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{work.title}</td>
                    <td className="py-3 px-2 text-muted-foreground">{work.author}</td>
                    <td className="py-3 px-2">
                      <Badge variant="secondary" className="text-[10px]">{work.category}</Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{work.submitted}</td>
                    <td className="py-3 px-2">
                      {work.status === "pending" && (
                        <Badge className="text-[10px] bg-amber-500/10 text-amber-600 border-none">
                          待审核
                        </Badge>
                      )}
                      {work.status === "approved" && (
                        <Badge className="text-[10px] bg-green-500/10 text-green-600 border-none">
                          已通过
                        </Badge>
                      )}
                      {work.status === "rejected" && (
                        <Badge className="text-[10px] bg-red-500/10 text-red-600 border-none">
                          已拒绝
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {work.status === "pending" && (
                          <>
                            <Button variant="ghost" size="sm" className="text-xs text-green-500 h-7">
                              <CheckCircle className="h-3 w-3 mr-1" /> 通过
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs text-red-500 h-7">
                              <XCircle className="h-3 w-3 mr-1" /> 拒绝
                            </Button>
                          </>
                        )}
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
