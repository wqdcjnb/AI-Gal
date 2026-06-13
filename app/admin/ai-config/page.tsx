"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Settings,
  Sparkles,
  Image,
  Music,
  FileText,
  Eye,
  EyeOff,
  Key,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"

const aiServices = [
  {
    id: "text",
    name: "文案 AI",
    icon: FileText,
    description: "用于世界观、角色人设、对话生成",
    model: "Claude API",
    keyConfigured: true,
    usageToday: 12450,
    usageLimit: 50000,
  },
  {
    id: "image",
    name: "绘图 AI",
    icon: Image,
    description: "用于角色立绘、场景背景 CG 生成",
    model: "Stable Diffusion API",
    keyConfigured: true,
    usageToday: 3840,
    usageLimit: 10000,
  },
  {
    id: "audio",
    name: "音频 AI",
    icon: Music,
    description: "用于 BGM 背景音乐和短音效生成",
    model: "Suno API",
    keyConfigured: false,
    usageToday: 820,
    usageLimit: 5000,
  },
]

export default function AIConfigPage() {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  const toggleKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI 接口配置</h1>
        <p className="text-muted-foreground mt-1">管理各类 AI 模型的 API 密钥和用量统计</p>
      </div>

      {aiServices.map((service) => {
        const Icon = service.icon
        const usagePercent = Math.round((service.usageToday / service.usageLimit) * 100)

        return (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </div>
                </div>
                <Badge className={service.keyConfigured ? "bg-green-500/10 text-green-600 border-none" : "bg-red-500/10 text-red-600 border-none"}>
                  {service.keyConfigured ? "已配置" : "未配置"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Model */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">模型</span>
                <span className="font-medium">{service.model}</span>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <Label className="text-xs">API 密钥</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      type={showKeys[service.id] ? "text" : "password"}
                      value={service.keyConfigured ? "sk-••••••••••••••••••••••••" : ""}
                      placeholder="输入 API 密钥..."
                      className="pl-9 h-9 text-xs font-mono"
                      readOnly
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => toggleKey(service.id)}
                  >
                    {showKeys[service.id] ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    今日用量
                  </span>
                  <span className="font-medium">
                    {service.usageToday.toLocaleString()} / {service.usageLimit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usagePercent} className="h-1.5" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  测试连接
                </Button>
                <Button size="sm">
                  <Settings className="h-3.5 w-3.5" />
                  更新配置
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
