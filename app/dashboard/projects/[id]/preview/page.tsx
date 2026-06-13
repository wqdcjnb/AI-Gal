"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  SkipForward,
  ChevronLeft,
  Pencil,
  Maximize2,
  Minimize2,
} from "lucide-react"
import Link from "next/link"

const chapters = [
  { id: "ch-1", title: "第一章：樱吹雪的相遇" },
  { id: "ch-2", title: "第二章：社团的选择" },
  { id: "ch-3", title: "第三章：午后的图书馆" },
  { id: "ch-4", title: "第四章：文化祭的准备" },
  { id: "ch-5", title: "第五章：雨夜的告白" },
]

interface PreviewLine {
  character?: string
  text: string
  type: "dialogue" | "narration"
}

const mockScene: PreviewLine[] = [
  { type: "narration", text: "午后的阳光透过图书馆的窗户，在木质地板上投下斑驳的光影。" },
  {
    character: "林小樱",
    text: "这本书...你也喜欢看吗？",
    type: "dialogue",
  },
  {
    character: "主角",
    text: "啊，是的。这是我今年最喜欢的一本小说。没想到你也读过了。",
    type: "dialogue",
  },
  {
    character: "林小樱",
    text: "嗯...我很喜欢作者的文笔。特别是描写日常生活的那些段落，让人感觉很温暖。",
    type: "dialogue",
  },
  { type: "narration", text: "她说话的时候，手指轻轻摩挲着书页的边缘，脸上浮现出淡淡的笑意。" },
]

export default function PreviewPage() {
  const params = useParams()
  const projectId = params.id as string
  const [startChapter, setStartChapter] = useState(chapters[0].id)
  const [currentLine, setCurrentLine] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

  const handleNext = () => {
    if (currentLine < mockScene.length - 1) {
      setCurrentLine((prev) => prev + 1)
    }
    // Show choices at a certain point
    if (currentLine === mockScene.length - 2) {
      setShowChoices(true)
    }
  }

  const handleChoice = () => {
    setShowChoices(false)
  }

  const line = mockScene[currentLine]

  return (
    <ProjectLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">起始章节</label>
              <Select value={startChapter} onValueChange={(v: string) => { setStartChapter(v); setCurrentLine(0); setShowChoices(false); }}>
                <SelectTrigger className="h-8 w-48 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch.id} value={ch.id}>
                      {ch.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="mt-auto"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/dialogue`}>
              <Pencil className="h-3.5 w-3.5" />
              发现问题？去编辑
            </Link>
          </Button>
        </div>

        {/* Ren'Py Simulator */}
        <div className={`rounded-2xl overflow-hidden border border-border shadow-xl bg-black ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
          <div className="relative aspect-[16/9]">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-200/20 via-purple-200/20 to-pink-200/20 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/20">
              {/* Scene gradient simulating a library/school */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-100/30 to-amber-200/40 dark:from-amber-900/30 dark:to-amber-800/20" />
              {/* Window light */}
              <div className="absolute top-0 right-1/4 w-32 h-full bg-gradient-to-b from-yellow-100/40 to-transparent dark:from-yellow-200/10" />
              {/* Bookshelf silhouettes */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-amber-900/20 dark:bg-amber-900/40" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-amber-900/15 dark:bg-amber-900/30" />
            </div>

            {/* Character Layer */}
            <div className="absolute inset-0 flex items-end justify-center gap-16 pb-20">
              {/* Left character (小樱) */}
              <div className="relative w-28 h-48 flex items-end justify-center">
                <div className="w-20 h-44 bg-gradient-to-b from-pink-400/40 to-pink-300/30 dark:from-pink-500/30 dark:to-pink-400/20 rounded-t-full" />
                {/* Hair */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 bg-pink-500/40 dark:bg-pink-600/30 rounded-t-full" />
              </div>
            </div>

            {/* Scene indicator */}
            <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/40 text-white/70 text-xs backdrop-blur-sm">
              图书馆 · 午后
            </div>

            {/* Chapter indicator */}
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/40 text-white/70 text-xs backdrop-blur-sm">
              {chapters.find((c) => c.id === startChapter)?.title}
            </div>

            {/* Dialogue Box */}
            <div className="absolute bottom-0 left-0 right-0">
              {line && (
                <div
                  onClick={handleNext}
                  className="mx-3 mb-4 bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4 cursor-pointer hover:bg-black/80 transition-colors"
                >
                  {line.type === "dialogue" && line.character && (
                    <p className="text-white/80 text-xs font-semibold mb-1.5">
                      {line.character}
                    </p>
                  )}
                  <p className="text-white/90 text-sm leading-relaxed select-none">
                    {line.text}
                  </p>
                  {currentLine < mockScene.length - 1 && !showChoices && (
                    <div className="absolute bottom-3 right-3">
                      <SkipForward className="h-4 w-4 text-white/40 animate-pulse" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Choice Overlay */}
            {showChoices && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="space-y-3 w-80">
                  <p className="text-white/80 text-sm text-center mb-2">做出你的选择...</p>
                  {[
                    "好啊，我也想去看海",
                    "抱歉，今天有点事...",
                    "（沉默不语）",
                  ].map((choice, i) => (
                    <button
                      key={i}
                      onClick={handleChoice}
                      className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white/90 text-sm hover:bg-white/20 hover:border-white/30 transition-all text-left"
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls info */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>点击对话框继续</span>
          <span className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            第 {currentLine + 1}/{mockScene.length} 行
          </span>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${projectId}/bgm`}>
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            <Link href={`/dashboard/projects/${projectId}/export`}>
              导出 Ren&apos;Py <ChevronLeft className="h-4 w-4 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </ProjectLayout>
  )
}
