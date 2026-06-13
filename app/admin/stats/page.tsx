"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Users,
  FileCheck,
  Download,
  Sparkles,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

const overviewStats = [
  { label: "总用户数", value: "12,845", change: "+12%", up: true, icon: Users },
  { label: "总项目数", value: "58,320", change: "+24%", up: true, icon: FileCheck },
  { label: "总导出量", value: "32,150", change: "+18%", up: true, icon: Download },
  { label: "AI 调用总量", value: "2.4M", change: "+32%", up: true, icon: Sparkles },
]

const monthlyData = [
  { month: "1月", users: 5200, projects: 18000, exports: 8500 },
  { month: "2月", users: 6800, projects: 24000, exports: 12000 },
  { month: "3月", users: 8200, projects: 32000, exports: 18000 },
  { month: "4月", users: 9800, projects: 40000, exports: 24000 },
  { month: "5月", users: 11200, projects: 48000, exports: 29000 },
  { month: "6月", users: 12845, projects: 58320, exports: 32150 },
]

const categoryDistribution = [
  { category: "校园", count: 12500, percent: 21 },
  { category: "恋爱", count: 10800, percent: 19 },
  { category: "奇幻", count: 8900, percent: 15 },
  { category: "异世界", count: 7600, percent: 13 },
  { category: "悬疑", count: 5800, percent: 10 },
  { category: "日常", count: 5200, percent: 9 },
  { category: "古风", count: 4200, percent: 7 },
  { category: "科幻", count: 3320, percent: 6 },
]

export default function StatsPage() {
  const maxMonthlyValue = Math.max(...monthlyData.map((d) => d.projects))

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">数据统计</h1>
        <p className="text-muted-foreground mt-1">网站项目创建量、导出量、AI 消耗统计</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 text-purple-500" />
                </div>
                <Badge className={`text-[10px] border-none ${
                  stat.up ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                }`}>
                  {stat.up ? <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDown className="h-2.5 w-2.5 mr-0.5" />}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend - Simple Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              月度趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyData.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.month}</span>
                    <span className="font-medium">{item.projects.toLocaleString()} 项目</span>
                  </div>
                  <div className="h-5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all flex items-center justify-end pr-2"
                      style={{ width: `${(item.projects / maxMonthlyValue) * 100}%` }}
                    >
                      <span className="text-[10px] text-white font-medium">
                        {item.exports.toLocaleString()} 导出
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              分类分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryDistribution.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.category}</span>
                    <span className="text-muted-foreground text-xs">
                      {item.count.toLocaleString()} ({item.percent}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
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
