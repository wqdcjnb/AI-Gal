"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Image as ImageIcon,
  Loader2,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Cloud,
  Home,
} from "lucide-react"
import Link from "next/link"
import type { SceneVersion } from "@/types/project"

interface MockBackground {
  id: string
  chapterId: string
  chapterTitle: string
  sceneName: string
  versions: { version: SceneVersion; url: string }[]
}

const mockChapters = [
  { id: "ch-1", title: "第一章：樱吹雪的相遇" },
  { id: "ch-2", title: "第二章：社团的选择" },
  { id: "ch-3", title: "第三章：午后的图书馆" },
  { id: "ch-4", title: "第四章：文化祭的准备" },
  { id: "ch-5", title: "第五章：雨夜的告白" },
]

const sceneVersions: { value: SceneVersion; label: string; icon: typeof Sun }[] = [
  { value: "室内", label: "室内", icon: Home },
  { value: "室外", label: "室外", icon: Cloud },
  { value: "昼夜", label: "昼", icon: Sun },
  { value: "黄昏", label: "黄昏", icon: Sun },
  { value: "夜晚", label: "夜晚", icon: Moon },
]

const initialBackgrounds: MockBackground[] = [
  {
    id: "bg-1",
    chapterId: "ch-1",
    chapterTitle: "第一章：樱吹雪的相遇",
    sceneName: "樱花树下的校园",
    versions: [
      { version: "室外", url: "" },
      { version: "昼夜", url: "" },
    ],
  },
  {
    id: "bg-2",
    chapterId: "ch-3",
    chapterTitle: "第三章：午后的图书馆",
    sceneName: "学校图书馆",
    versions: [
      { version: "室内", url: "" },
      { version: "黄昏", url: "" },
    ],
  },
  {
    id: "bg-3",
    chapterId: "ch-5",
    chapterTitle: "第五章：雨夜的告白",
    sceneName: "雨夜中的教室",
    versions: [
      { version: "室内", url: "" },
      { version: "夜晚", url: "" },
    ],
  },
]

export default function BackgroundsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [backgrounds, setBackgrounds] = useState<MockBackground[]>(initialBackgrounds)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [newSceneName, setNewSceneName] = useState("")
  const [newSceneChapter, setNewSceneChapter] = useState(mockChapters[0].id)

  const handleGenerate = async (bgId: string, version: SceneVersion) => {
    setGeneratingId(`${bgId}-${version}`)
    await new Promise((r) => setTimeout(r, 1500))
    setGeneratingId(null)
  }

  const handleAddBackground = () => {
    if (!newSceneName.trim()) return
    const chapter = mockChapters.find((c) => c.id === newSceneChapter)
    const newBg: MockBackground = {
      id: `bg-${Date.now()}`,
      chapterId: newSceneChapter,
      chapterTitle: chapter?.title || "",
      sceneName: newSceneName.trim(),
      versions: [{ version: "室内", url: "" }],
    }
    setBackgrounds((prev) => [...prev, newBg])
    setNewSceneName("")
  }

  const handleDeleteBackground = (id: string) => {
    setBackgrounds((prev) => prev.filter((b) => b.id !== id))
  }

  // Group backgrounds by chapter
  const grouped = backgrounds.reduce(
    (acc, bg) => {
      if (!acc[bg.chapterId]) acc[bg.chapterId] = []
      acc[bg.chapterId].push(bg)
      return acc
    },
    {} as Record<string, MockBackground[]>
  )

  return (
    <ProjectLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Add new background */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              新增场景背景
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs">场景名称</Label>
                <Input
                  value={newSceneName}
                  onChange={(e) => setNewSceneName(e.target.value)}
                  placeholder="例如：学校天台"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">关联章节</Label>
                <Select value={newSceneChapter} onValueChange={setNewSceneChapter}>
                  <SelectTrigger className="h-9 w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockChapters.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id}>
                        {ch.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBackground} disabled={!newSceneName.trim()}>
                添加
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-1" />
                本地上传
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backgrounds by chapter */}
        {Object.entries(grouped).map(([chapterId, chapterBgs]) => (
          <div key={chapterId} className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-purple-500" />
              {chapterBgs[0]?.chapterTitle || chapterId}
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapterBgs.map((bg) => (
                <Card key={bg.id} className="overflow-hidden group">
                  <div className="aspect-video bg-gradient-to-br from-purple-500/5 to-pink-500/5 flex items-center justify-center relative">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 flex-wrap">
                      {bg.versions.map((ver) => {
                        const versionInfo = sceneVersions.find((v) => v.value === ver.version)
                        const isGenerating = generatingId === `${bg.id}-${ver.version}`
                        const Icon = versionInfo?.icon || ImageIcon
                        return (
                          <button
                            key={ver.version}
                            onClick={() => handleGenerate(bg.id, ver.version)}
                            disabled={isGenerating}
                            className="px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs flex items-center gap-1 hover:bg-background transition-colors"
                          >
                            {isGenerating ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Icon className="h-3 w-3" />
                            )}
                            {ver.version}
                          </button>
                        )
                      })}
                    </div>
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteBackground(bg.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-sm font-medium">{bg.sceneName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bg.versions.length} 个版本 · AI 生成
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {backgrounds.length === 0 && (
          <div className="text-center py-16">
            <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">还没有场景背景，添加一个吧</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${projectId}/dialogue`}>
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            <Link href={`/dashboard/projects/${projectId}/bgm`}>
              下一步：BGM音效 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </ProjectLayout>
  )
}
