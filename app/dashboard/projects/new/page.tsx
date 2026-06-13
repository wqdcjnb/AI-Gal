"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useProject } from "@/components/project/project-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Upload,
  FileText,
  BookOpen,
} from "lucide-react"
import Link from "next/link"
import type { GameCategory, StoryLength } from "@/types/project"

const categories: GameCategory[] = [
  "校园",
  "奇幻",
  "悬疑",
  "异世界",
  "日常",
  "科幻",
  "恋爱",
  "古风",
]

const storyLengths: { value: StoryLength; label: string; desc: string }[] = [
  { value: "短篇", label: "短篇", desc: "约 3 章，适合快速讲完一个小故事" },
  { value: "中篇", label: "中篇", desc: "约 8 章，标准的 Galgame 叙事篇幅" },
  { value: "长篇", label: "长篇", desc: "15+ 章，宏大的多分支叙事" },
]

export default function NewProjectPage() {
  const router = useRouter()
  const { createProject, updateProject } = useProject()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<GameCategory>("校园")
  const [storyLength, setStoryLength] = useState<StoryLength>("短篇")
  const [worldSetting, setWorldSetting] = useState("")
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleGenerateWorldSetting = async () => {
    if (!name) return
    setGenerating(true)
    // 模拟 AI 生成世界观
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const mockSettings: Record<string, string> = {
      校园: "故事发生在一所临海小镇的私立高中。夏日的海风吹拂着校园的每一个角落，樱花树下的约定，天台上的秘密，放学后的社团活动……青春的故事在这里悄然展开。",
      奇幻: "在这片名为「艾尔兰蒂亚」的大陆上，魔法与剑术并存。龙族盘踞在北方山脉，精灵隐居在翡翠森林，而人类则在平原上建立起繁荣的王国。一场席卷大陆的风暴即将来临……",
      悬疑: "深夜的都市，霓虹灯下隐藏着不为人知的秘密。一桩离奇的案件将几个陌生人的命运交织在一起。每个人都有自己的过去，而真相远比想象中更加黑暗。",
      异世界: "平凡的高中生在某天被召唤到了异世界。这里有着与地球完全不同的法则，冒险者公会、魔法学院、魔兽森林……在寻找回家之路的同时，一段传奇冒险就此展开。",
      日常: "这是一座安静的小城，没有惊天动地的大事件，却有温暖人心的日常。咖啡店的香气、图书馆的静谧、公园里的相遇……平凡的日子因为与你的交集而变得特别。",
      科幻: "公元 2157 年，人类已经迈入星际殖民时代。人工智能、基因改造、意识上传成为日常。在巨型空间站「新伊甸」上，一场关乎人类未来的抉择即将展开。",
      恋爱: "樱花盛开的季节，命运的齿轮悄然转动。在错过的地铁站、偶然的图书馆、雨中的公园，每一次相遇都是巧合还是必然？这是一段关于爱与成长的故事。",
      古风: "江南烟雨，长安繁华。在这个架空的大楚王朝，才子佳人、江湖侠客、朝堂风云交织成一幅壮丽的画卷。一曲琵琶诉不尽天下兴亡，一纸书信道不完儿女情长。",
    }
    setWorldSetting(mockSettings[category] || mockSettings["校园"])
    setGenerating(false)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    // 创建项目并跳转
    const project = createProject()
    updateProject(project.id, {
      name: name.trim(),
      description,
      category,
      storyLength,
      worldSetting,
      currentStep: 1,
    })
    router.push(`/dashboard/projects/${project.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            返回
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">新建项目</h1>
          <p className="text-sm text-muted-foreground">步骤 1/6 · 项目基础配置</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-purple-500" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>游戏名称 *</Label>
              <Input
                placeholder="给你的 Galgame 起个名字..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea
                placeholder="简单介绍一下你的故事..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>作品封面</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  点击上传封面图片（可选）
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG/JPG, 推荐 400x600
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>游戏分类</Label>
                <Select value={category} onValueChange={(v: string) => setCategory(v as GameCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>故事篇幅</Label>
                <Select value={storyLength} onValueChange={(v: string) => setStoryLength(v as StoryLength)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {storyLengths.map((sl) => (
                      <SelectItem key={sl.value} value={sl.value}>
                        {sl.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {storyLength && (
              <p className="text-xs text-muted-foreground">
                {storyLengths.find((s) => s.value === storyLength)?.desc}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 世界观设定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-purple-500" />
              世界观设定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="描述你的故事世界观，或使用 AI 自动生成..."
              value={worldSetting}
              onChange={(e) => setWorldSetting(e.target.value)}
              rows={5}
            />
            <Button
              variant="outline"
              onClick={handleGenerateWorldSetting}
              disabled={generating || !name}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 正在构思世界观...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  AI 生成世界观设定
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">取消</Link>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim() || saving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                保存并开始创作
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
