"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  UserRound,
  RefreshCw,
  Image,
  Music,
  GitMerge,
} from "lucide-react"
import Link from "next/link"
import type { ToneType } from "@/types/project"

interface MockLine {
  id: string
  type: "narration" | "dialogue" | "instruction"
  characterName?: string
  text: string
  tone?: ToneType
}

interface MockBranch {
  id: string
  text: string
  targetChapter: string
}

const mockChapters: { id: string; title: string }[] = [
  { id: "ch-1", title: "第一章：樱吹雪的相遇" },
  { id: "ch-2", title: "第二章：社团的选择" },
  { id: "ch-3", title: "第三章：午后的图书馆" },
  { id: "ch-4", title: "第四章：文化祭的准备" },
  { id: "ch-5", title: "第五章：雨夜的告白" },
]

const tones: ToneType[] = ["傲娇", "冷淡", "温柔", "腹黑", "元气", "成熟", "慵懒"]

const quickActions = [
  { label: "角色出场", icon: UserRound, template: "[林小樱 出场]" },
  { label: "背景切换", icon: Image, template: "[背景切换：教室]" },
  { label: "BGM标记", icon: Music, template: "[BGM：日常_温馨]" },
  { label: "分支开始", icon: GitMerge, template: "[分支选项]" },
]

const initialLines: MockLine[] = [
  { id: "l-1", type: "narration", text: "午后的阳光透过图书馆的窗户，在木质地板上投下斑驳的光影。" },
  {
    id: "l-2",
    type: "dialogue",
    characterName: "林小樱",
    text: "这本书...你也喜欢看吗？",
    tone: "温柔",
  },
  {
    id: "l-3",
    type: "dialogue",
    characterName: "主角",
    text: "啊，是的。这是我今年最喜欢的一本小说。没想到你也读过了。",
  },
  {
    id: "l-4",
    type: "dialogue",
    characterName: "林小樱",
    text: "嗯...我很喜欢作者的文笔。特别是描写日常生活的那些段落，让人感觉很温暖。",
    tone: "害羞",
  },
  { id: "l-5", type: "narration", text: "她说话的时候，手指轻轻摩挲着书页的边缘，脸上浮现出淡淡的笑意。" },
]

export default function DialoguePage() {
  const params = useParams()
  const projectId = params.id as string
  const [selectedChapter, setSelectedChapter] = useState(mockChapters[0].id)
  const [lines, setLines] = useState<MockLine[]>(initialLines)
  const [branches, setBranches] = useState<MockBranch[]>([])
  const [generating, setGenerating] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const handleGenerateAll = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    setGenerating(false)
  }

  const handleRegenerateLine = async (id: string) => {
    setRegeneratingId(id)
    await new Promise((r) => setTimeout(r, 1000))
    setRegeneratingId(null)
  }

  const handleAddLine = (type: MockLine["type"]) => {
    const newLine: MockLine = {
      id: `l-${Date.now()}`,
      type,
      text: "",
      characterName: type === "dialogue" ? "角色名" : undefined,
    }
    setLines((prev) => [...prev, newLine])
  }

  const handleDeleteLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id))
  }

  const handleAddBranch = () => {
    setBranches((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        text: "新选项",
        targetChapter: mockChapters[mockChapters.length - 1].id,
      },
    ])
  }

  const handleDeleteBranch = (id: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id))
  }

  const handleQuickAction = (template: string) => {
    const newLine: MockLine = {
      id: `l-${Date.now()}`,
      type: "instruction",
      text: template,
    }
    setLines((prev) => [...prev, newLine])
  }

  return (
    <ProjectLayout>
      <div className="flex gap-4">
        {/* Left: Chapter Selector */}
        <div className="w-52 shrink-0 space-y-3">
          <h3 className="text-sm font-semibold">章节选择</h3>
          <div className="space-y-1">
            {mockChapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChapter(ch.id)}
                className={`w-full text-left p-2.5 rounded-lg text-sm transition-colors ${
                  selectedChapter === ch.id
                    ? "bg-foreground text-background"
                    : "hover:bg-accent"
                }`}
              >
                <p className="font-medium text-xs truncate">{ch.title}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Dialogue Editor */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickAction(action.template)}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
            <Button
              onClick={handleGenerateAll}
              disabled={generating}
              variant="outline"
              size="sm"
            >
              {generating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              )}
              AI 生成本章对话
            </Button>
          </div>

          {/* Dialogue Lines */}
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className={`p-3 rounded-xl border group ${
                  line.type === "narration"
                    ? "bg-muted/30 border-border/50"
                    : line.type === "instruction"
                      ? "bg-purple-500/5 border-purple-500/20"
                      : "border-border"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Line type indicator */}
                  <div className="shrink-0 pt-1">
                    {line.type === "narration" && (
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        旁白
                      </span>
                    )}
                    {line.type === "dialogue" && (
                      <div className="flex items-center gap-1">
                        <UserRound className="h-3 w-3 text-purple-500" />
                        <Input
                          value={line.characterName || ""}
                          onChange={(e) => {
                            const updated = lines.map((l) =>
                              l.id === line.id
                                ? { ...l, characterName: e.target.value }
                                : l
                            )
                            setLines(updated)
                          }}
                          className="h-6 w-20 text-xs border-none bg-transparent px-0 font-medium focus-visible:ring-0"
                          placeholder="角色名"
                        />
                      </div>
                    )}
                    {line.type === "instruction" && (
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-600 border-none">
                        指令
                      </Badge>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <Textarea
                      value={line.text}
                      onChange={(e) => {
                        const updated = lines.map((l) =>
                          l.id === line.id ? { ...l, text: e.target.value } : l
                        )
                        setLines(updated)
                      }}
                      rows={line.type === "narration" ? 2 : 1}
                      className="text-sm resize-none border-none bg-transparent px-0 focus-visible:ring-0 min-h-0"
                      placeholder={
                        line.type === "narration"
                          ? "输入旁白描述..."
                          : line.type === "dialogue"
                            ? "输入对话文本..."
                            : "指令内容"
                      }
                    />

                    {/* Tone selector for dialogue */}
                    {line.type === "dialogue" && (
                      <Select
                        value={line.tone || "温柔"}
                        onValueChange={(v: string) => {
                          const updated = lines.map((l) =>
                            l.id === line.id ? { ...l, tone: v as ToneType } : l
                          )
                          setLines(updated)
                        }}
                      >
                        <SelectTrigger className="h-6 w-24 text-[10px] mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRegenerateLine(line.id)}
                      disabled={regeneratingId === line.id}
                    >
                      {regeneratingId === line.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDeleteLine(line.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add line buttons */}
            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => handleAddLine("narration")}
              >
                <Plus className="h-3 w-3" /> 添加旁白
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => handleAddLine("dialogue")}
              >
                <Plus className="h-3 w-3" /> 添加对话
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Branch Options */}
        <div className="w-60 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              <GitBranch className="h-3.5 w-3.5 text-purple-500" />
              分支选项
            </h3>
            <Button size="sm" variant="ghost" onClick={handleAddBranch}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="space-y-2">
            {branches.map((branch) => (
              <Card key={branch.id} className="p-3">
                <div className="space-y-2">
                  <Textarea
                    value={branch.text}
                    onChange={(e) => {
                      const updated = branches.map((b) =>
                        b.id === branch.id ? { ...b, text: e.target.value } : b
                      )
                      setBranches(updated)
                    }}
                    rows={2}
                    className="text-xs resize-none"
                    placeholder="选项文本..."
                  />
                  <Select
                    value={branch.targetChapter}
                    onValueChange={(v: string) => {
                      const updated = branches.map((b) =>
                        b.id === branch.id ? { ...b, targetChapter: v } : b
                      )
                      setBranches(updated)
                    }}
                  >
                    <SelectTrigger className="h-7 text-[10px]">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-red-500 h-7"
                    onClick={() => handleDeleteBranch(branch.id)}
                  >
                    <Trash2 className="h-3 w-3" /> 删除
                  </Button>
                </div>
              </Card>
            ))}
            {branches.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                暂无分支选项，点击 + 添加
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" asChild>
          <Link href={`/dashboard/projects/${projectId}/outline`}>
            <ChevronLeft className="h-4 w-4" /> 上一步
          </Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
          <Link href={`/dashboard/projects/${projectId}/backgrounds`}>
            下一步：背景CG <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </ProjectLayout>
  )
}
