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
import { ArrowRight, FileText, BookOpen, Upload } from "lucide-react"
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
  const [category, setCategory] = useState<GameCategory>(project?.category || "校园")
  const [storyLength, setStoryLength] = useState<StoryLength>(project?.storyLength || "短篇")
  const [worldSetting, setWorldSetting] = useState(project?.worldSetting || "")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setDescription(project.description)
      setCategory(project.category)
      setStoryLength(project.storyLength)
      setWorldSetting(project.worldSetting)
    }
  }, [project])

  const handleSave = () => {
    if (!name.trim()) return
    updateProject(projectId, {
      name: name.trim(),
      description,
      category,
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
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                <p className="text-sm text-muted-foreground">上传封面 (可选)</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>分类</Label>
                <Select value={category} onValueChange={(v: string) => setCategory(v as GameCategory)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
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
