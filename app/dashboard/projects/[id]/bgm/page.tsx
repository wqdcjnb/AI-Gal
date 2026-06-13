"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import {
  Music,
  Sparkles,
  Loader2,
  Play,
  Pause,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Link2,
  Plus,
} from "lucide-react"
import type { MoodType } from "@/types/project"

interface MockAudio {
  id: string
  name: string
  type: "bgm" | "sound_effect"
  mood: MoodType
  duration: number
  boundChapters: string[]
}

const chapters = [
  { id: "ch-1", title: "第一章：樱吹雪的相遇" },
  { id: "ch-2", title: "第二章：社团的选择" },
  { id: "ch-3", title: "第三章：午后的图书馆" },
  { id: "ch-4", title: "第四章：文化祭的准备" },
  { id: "ch-5", title: "第五章：雨夜的告白" },
]

const moods: { value: MoodType; label: string; color: string }[] = [
  { value: "温馨", label: "温馨", color: "bg-orange-500/10 text-orange-600" },
  { value: "紧张", label: "紧张", color: "bg-red-500/10 text-red-600" },
  { value: "悲伤", label: "悲伤", color: "bg-blue-500/10 text-blue-600" },
  { value: "日常", label: "日常", color: "bg-green-500/10 text-green-600" },
  { value: "激昂", label: "激昂", color: "bg-yellow-500/10 text-yellow-600" },
  { value: "神秘", label: "神秘", color: "bg-purple-500/10 text-purple-600" },
  { value: "欢乐", label: "欢乐", color: "bg-pink-500/10 text-pink-600" },
]

const initialAudio: MockAudio[] = [
  {
    id: "au-1",
    name: "阳光下的校园",
    type: "bgm",
    mood: "日常",
    duration: 120,
    boundChapters: ["ch-1", "ch-3"],
  },
  {
    id: "au-2",
    name: "不安的预感",
    type: "bgm",
    mood: "紧张",
    duration: 90,
    boundChapters: ["ch-2"],
  },
  {
    id: "au-3",
    name: "雨夜的思念",
    type: "bgm",
    mood: "悲伤",
    duration: 150,
    boundChapters: ["ch-5"],
  },
  {
    id: "au-4",
    name: "点击音效",
    type: "sound_effect",
    mood: "日常",
    duration: 1,
    boundChapters: [],
  },
]

export default function BGMPage() {
  const params = useParams()
  const projectId = params.id as string
  const [audioAssets, setAudioAssets] = useState<MockAudio[]>(initialAudio)
  const [generating, setGenerating] = useState(false)
  const [selectedMood, setSelectedMood] = useState<MoodType>("温馨")
  const [playingId, setPlayingId] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    const newAudio: MockAudio = {
      id: `au-${Date.now()}`,
      name: `${selectedMood}_BGM_${audioAssets.length + 1}`,
      type: "bgm",
      mood: selectedMood,
      duration: Math.floor(Math.random() * 120) + 60,
      boundChapters: [],
    }
    setAudioAssets((prev) => [...prev, newAudio])
    setGenerating(false)
  }

  const handleDelete = (id: string) => {
    setAudioAssets((prev) => prev.filter((a) => a.id !== id))
  }

  const handleBindChapter = (audioId: string, chapterId: string) => {
    setAudioAssets((prev) =>
      prev.map((a) => {
        if (a.id !== audioId) return a
        const isBound = a.boundChapters.includes(chapterId)
        return {
          ...a,
          boundChapters: isBound
            ? a.boundChapters.filter((c) => c !== chapterId)
            : [...a.boundChapters, chapterId],
        }
      })
    )
  }

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id)
  }

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <ProjectLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Generate Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Music className="h-4 w-4 text-purple-500" />
              AI 生成音乐
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">场景氛围</Label>
                <Select value={selectedMood} onValueChange={(v: string) => setSelectedMood(v as MoodType)}>
                  <SelectTrigger className="h-9 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moods.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    生成 BGM
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                生成短音效
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio List */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-purple-500" />
            素材库 ({audioAssets.length})
          </h3>
          {audioAssets.map((audio) => (
            <Card key={audio.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Play Button */}
                  <button
                    onClick={() => togglePlay(audio.id)}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center shrink-0 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors"
                  >
                    {playingId === audio.id ? (
                      <Pause className="h-4 w-4 text-purple-500" />
                    ) : (
                      <Play className="h-4 w-4 text-purple-500 ml-0.5" />
                    )}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{audio.name}</p>
                      <Badge className="text-[10px] bg-muted border-none">
                        {audio.type === "bgm" ? "BGM" : "音效"}
                      </Badge>
                      <Badge
                        className={`text-[10px] border-none ${
                          moods.find((m) => m.value === audio.mood)?.color || ""
                        }`}
                      >
                        {audio.mood}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDuration(audio.duration)} · AI 生成
                    </p>
                    {/* Chapter bindings */}
                    {audio.boundChapters.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                        {audio.boundChapters.map((chId) => {
                          const ch = chapters.find((c) => c.id === chId)
                          return (
                            <Badge
                              key={chId}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {ch?.title}
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Chapter bind buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {chapters.map((ch) => {
                      const isBound = audio.boundChapters.includes(ch.id)
                      return (
                        <button
                          key={ch.id}
                          onClick={() => handleBindChapter(audio.id, ch.id)}
                          className={`px-2 py-1 rounded text-[10px] transition-colors ${
                            isBound
                              ? "bg-purple-500/10 text-purple-600"
                              : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          第{chapters.indexOf(ch) + 1}章
                        </button>
                      )
                    })}
                  </div>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleDelete(audio.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${projectId}/backgrounds`}>
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            <Link href={`/dashboard/projects/${projectId}/preview`}>
              在线预览 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </ProjectLayout>
  )
}
