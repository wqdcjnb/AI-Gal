"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  FileCheck,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Activity,
} from "lucide-react"

const stats = [
  { label: "注册用户", value: "12,845", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", change: "+124" },
  { label: "项目总数", value: "58,320", icon: FileCheck, color: "text-green-500", bg: "bg-green-500/10", change: "+1,240" },
  { label: "今日导出", value: "843", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", change: "+45" },
  { label: "AI调用量", value: "2.4M", icon: Sparkles, color: "text-orange-500", bg: "bg-orange-500/10", change: "+85K" },
]

const recentActivities = [
  { user: "用户***@qq.com", action: "创建了新项目「夏日幻梦」", time: "2 分钟前", type: "create" },
  { user: "用户***@163.com", action: "完成了角色立绘生成", time: "5 分钟前", type: "ai" },
  { user: "用户***@gmail.com", action: "导出了 Ren'Py 工程", time: "8 分钟前", type: "export" },
  { user: "管理员", action: "审核通过了 3 个公开作品", time: "15 分钟前", type: "admin" },
  { user: "用户***@outlook.com", action: "举报了违规内容", time: "30 分钟前", type: "report" },
]

const pendingReviews = [
  { id: "r-1", title: "深夜迷案", author: "推理爱好者", submitted: "2026-06-13" },
  { id: "r-2", title: "星辰之约", author: "星空旅人", submitted: "2026-06-12" },
  { id: "r-3", title: "魔法学院", author: "奇幻写手", submitted: "2026-06-12" },
]

export default function AdminPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">管理概览</h1>
        <p className="text-muted-foreground mt-1">AI-Gal 后台管理系统</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-500 font-medium">{stat.change}</span>
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              最近动态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    activity.type === "create" ? "bg-green-500" :
                    activity.type === "ai" ? "bg-purple-500" :
                    activity.type === "export" ? "bg-blue-500" :
                    activity.type === "report" ? "bg-red-500" : "bg-amber-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p><span className="font-medium">{activity.user}</span> {activity.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              待审核作品 ({pendingReviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingReviews.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.author} · {item.submitted}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs rounded bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                      通过
                    </button>
                    <button className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
                      拒绝
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
