"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useProject } from "@/components/project/project-context"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CoverUpload } from "@/components/cover-upload"
import { ArrowRight, FileText, BookOpen, Minus, Plus } from "lucide-react"
import { useState } from "react"
import type { GameCategory, StoryLength } from "@/types/project"
import Link from "next/link"

const categories: GameCategory[] = [
  "校园", "奇幻", "悬疑", "异世界", "日常", "科幻", "恋爱", "古风",
]

export default function ProjectBasicInfo() {
  const params = useParams()
  const projectId = params.id as string
  const { getProject, updateProject } = useProject()

  const project = getProject(projectId)
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [tags, setTags] = useState<GameCategory[]>(project?.tags || [])
  const [storyLength, setStoryLength] = useState<StoryLength>(project?.storyLength || "短篇")
  const [chapterCount, setChapterCount] = useState(project?.chapterCount || 8)
  const [coverUrl, setCoverUrl] = useState(project?.coverUrl || "")
  const [worldSetting, setWorldSetting] = useState(project?.worldSetting || "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description)
      setCoverUrl(project.coverUrl || "")
      setTags(project.tags || [])
      setStoryLength(project.storyLength)
      setChapterCount(project.chapterCount || 8)
      setWorldSetting(project.worldSetting)
    }
  }, [project])

  const handleSave = () => {
    if (!name.trim()) return
    updateProject(projectId, {
      name: name.trim(),
      description,
      coverUrl,
      tags,
      storyLength,
      chapterCount,
      worldSetting,
      currentStep: 1,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ProjectLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-purple-500" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>游戏名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>简介</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>作品封面</Label>
              <CoverUpload
                value={coverUrl}
                onChange={(url) => setCoverUrl(url)}
                recommendedSize="400x600"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>游戏标签</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = tags.includes(cat)
                    return (
                      <button key={cat} type="button"
                        onClick={() => setTags(selected ? tags.filter((t) => t !== cat) : [...tags, cat])}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selected ? "bg-purple-500 text-white border-purple-500" : "bg-background text-muted-foreground border-border hover:border-purple-500/50"
                        }`}
                      >{cat}</button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>章节数量</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={chapterCount <= 3}
                    onClick={() => setChapterCount((c) => Math.max(3, c - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold tabular-nums">{chapterCount}</span>
                    <span className="text-sm text-muted-foreground ml-1">章</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    disabled={chapterCount >= 18}
                    onClick={() => setChapterCount((c) => Math.min(18, c + 1))}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">最少 3 章，最多 18 章。可在章节编辑中随时增减</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-purple-500" />
              世界观设定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={worldSetting}
              onChange={(e) => setWorldSetting(e.target.value)}
              rows={5}
              placeholder="描述你的故事世界观..."
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">返回项目列表</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} variant="outline">
              {saved ? "已保存 ✓" : "保存"}
            </Button>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
              <Link href={`/dashboard/projects/${projectId}/characters`}>
                下一步：角色生成 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </ProjectLayout>
  )
}
