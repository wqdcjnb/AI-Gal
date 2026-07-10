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
import { CoverUpload } from "@/components/cover-upload"
import { ArrowRight, FileText, BookOpen, Minus, Plus, Sparkles, Loader2 } from "lucide-react"
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
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const handleGenerateOutline = async () => {
    if (!name || !description) return
    setGenerating(true)
    try {
      const res = await fetch("/api/ai/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), chapterCount }),
      })
      const data = await res.json()
      if (data.success) setWorldSetting(data.outline.trim())
    } catch { /* 失败时保持当前内容 */ }
    finally { setGenerating(false) }
  }

  const handleSave = async () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = "请输入游戏名称"
    if (!description.trim()) errs.description = "请输入游戏简介"
    if (tags.length === 0) errs.tags = "请至少选择一个标签"
    if (!worldSetting.trim()) errs.worldSetting = "请输入大纲设定"
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    await updateProject(projectId, {
      name: name.trim(), description: description.trim(), coverUrl, tags, storyLength, chapterCount, worldSetting: worldSetting.trim(), currentStep: 1,
    })
    setSaving(false)
  }

  return (
    <ProjectLayout>
      <div className="max-w-2xl mx-auto space-y-6">
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
              <Input placeholder="给你的 Galgame 起个名字..." value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label>简介 *</Label>
              <Textarea placeholder="简单介绍一下你的故事..." value={description} onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: "" })) }} rows={2} />
              {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>
            <div className="space-y-2">
              <Label>作品封面</Label>
              <CoverUpload value={coverUrl} onChange={(url) => setCoverUrl(url)} recommendedSize="400x600" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>游戏标签 *（可多选）</Label>
                {errors.tags && <p className="text-xs text-red-500">{errors.tags}</p>}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const selected = tags.includes(cat)
                    return (
                      <button key={cat} type="button"
                        onClick={() => { setTags(selected ? tags.filter((t) => t !== cat) : [...tags, cat]); setErrors((p) => ({ ...p, tags: "" })) }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected ? "bg-purple-500 text-white border-purple-500" : "bg-background text-muted-foreground border-border hover:border-purple-500/50"}`}
                      >{cat}</button>
                    )
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>章节数量</Label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={chapterCount <= 3} onClick={() => setChapterCount((c) => Math.max(3, c - 1))}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold tabular-nums">{chapterCount}</span>
                    <span className="text-sm text-muted-foreground ml-1">章</span>
                  </div>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" disabled={chapterCount >= 18} onClick={() => setChapterCount((c) => Math.min(18, c + 1))}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">最少 3 章，最多 18 章。可在章节编辑中随时增减</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 大纲设定 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4 text-purple-500" />
              大纲设定
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="描述你的故事大纲，或使用 AI 自动生成..." value={worldSetting} onChange={(e) => { setWorldSetting(e.target.value); setErrors((p) => ({ ...p, worldSetting: "" })) }} className="min-h-[400px]" />
            {errors.worldSetting && <p className="text-xs text-red-500 mt-1">{errors.worldSetting}</p>}
            <Button variant="outline" onClick={handleGenerateOutline} disabled={generating || !name.trim() || !description.trim() || tags.length === 0} className="w-full">
              {generating ? (<><Loader2 className="h-4 w-4 animate-spin" />AI 正在构思大纲...</>) : (<><Sparkles className="h-4 w-4 text-purple-500" />AI 生成大纲设定</>)}
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">返回游戏列表</Link>
          </Button>
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving} variant="outline">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {saving ? "保存中..." : "保存"}
            </Button>
            {name.trim() && description.trim() && tags.length > 0 && worldSetting.trim() ? (
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
                <Link href={`/dashboard/projects/${projectId}/chapters`}>
                  下一步：章节制作 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button disabled className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none opacity-50 cursor-not-allowed">
                下一步：章节制作 <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </ProjectLayout>
  )
}
