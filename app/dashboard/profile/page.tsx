"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  UserCircle,
  Camera,
  Lock,
  History,
  Heart,
  Download,
  FileArchive,
  Eye,
} from "lucide-react"

const mockExportRecords = [
  { id: "e-1", project: "夏日幻梦", date: "2026-06-12", size: "24.5 MB" },
  { id: "e-2", project: "夏日幻梦", date: "2026-06-10", size: "22.1 MB" },
  { id: "e-3", project: "异世界冒险录", date: "2026-06-05", size: "18.3 MB" },
]

const mockFavorites = [
  { id: "f-1", name: "江南烟雨录", author: "古风写手", category: "古风" },
  { id: "f-2", name: "星辰之约", author: "星空旅人", category: "恋爱" },
  { id: "f-3", name: "深夜迷案", author: "推理爱好者", category: "悬疑" },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [nickname, setNickname] = useState(user?.email?.split("@")[0] || "")
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">个人中心</h1>
        <p className="text-muted-foreground mt-1">管理你的个人信息和账户设置</p>
      </div>

      {/* Avatar & Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCircle className="h-4 w-4 text-purple-500" />
            基本信息
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {nickname[0]?.toUpperCase() || "U"}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-background border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="font-medium">{nickname}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>昵称</Label>
            <Input value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </div>

          <Button onClick={handleSave}>
            {saved ? "已保存 ✓" : "保存修改"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-purple-500" />
            修改密码
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>当前密码</Label>
            <Input type="password" placeholder="输入当前密码" />
          </div>
          <div className="space-y-2">
            <Label>新密码</Label>
            <Input type="password" placeholder="输入新密码（至少6位）" />
          </div>
          <div className="space-y-2">
            <Label>确认新密码</Label>
            <Input type="password" placeholder="再次输入新密码" />
          </div>
          <Button>更新密码</Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-purple-500" />
            导出记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockExportRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <FileArchive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{record.project}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.date} · {record.size}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-purple-500" />
            收藏作品
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockFavorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{fav.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fav.author} · {fav.category}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Heart className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
