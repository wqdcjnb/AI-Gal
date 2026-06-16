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
import { ArrowRight, FileText, BookOpen } from "lucide-react"
import { useState } from "react"
import type { GameCategory, StoryLength } from "@/types/project"
import Link from "next/link"

const categories: GameCategory[] = [
  "校园", "奇幻", "悬疑", "异世界", "日常", "科幻", "恋爱", "古风",
]

const storyLengths: { value: StoryLength; label: string }[] = [
  { value: "短篇", label: "短篇 (约3章)" },
  { value: "中篇", label: "中篇 (约8章)" },
  { value: "长篇", label: "长篇 (15+章)" },
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
                <Label>篇幅</Label>
                <Select value={storyLength} onValueChange={(v: string) => setStoryLength(v as StoryLength)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {storyLengths.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
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
