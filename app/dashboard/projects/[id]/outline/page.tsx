"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookOpen,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"

interface MockChapter {
  id: string
  title: string
  summary: string
  isKeyNode: boolean
  branchTriggers: string[]
}

const mockChapters: MockChapter[] = [
  {
    id: "ch-1",
    title: "第一章：樱吹雪的相遇",
    summary:
      "新学期伊始，主角在樱花飞舞的校园中与林小樱相遇。两人在图书馆的偶然交谈中发现了彼此共同的文学爱好，命运的齿轮就此开始转动。同时，学生会长苏辰似乎对主角产生了某种兴趣...",
    isKeyNode: true,
    branchTriggers: ["选择接受苏辰的邀请 → 进入学生会线", "选择参加文学社活动 → 进入文学线"],
  },
  {
    id: "ch-2",
    title: "第二章：社团的选择",
    summary:
      "学校社团招新季到来，主角面临加入文学社还是学生会的抉择。林小樱邀请了主角加入文学社，而苏辰则以学生会的名义向主角抛出橄榄枝。这一选择将影响后续的故事走向。",
    isKeyNode: true,
    branchTriggers: ["加入文学社 → 小樱线", "加入学生会 → 苏辰线"],
  },
  {
    id: "ch-3",
    title: "第三章：午后的图书馆",
    summary:
      "在图书馆备考的日子里，主角与林小樱的关系逐渐升温。两人一起整理书籍、讨论小说、分享各自的梦想。然而，林小樱似乎隐藏着某个不为人知的秘密...",
    isKeyNode: false,
    branchTriggers: [],
  },
  {
    id: "ch-4",
    title: "第四章：文化祭的准备",
    summary:
      "一年一度的文化祭即将到来，各班级和社团都在紧张准备。文学社决定上演一出原创话剧，而学生会则负责整个活动的统筹。两条不同的道路让主角面临更多选择。",
    isKeyNode: true,
    branchTriggers: ["帮助文学社的话剧 → 深入了解小樱", "协助学生会的统筹 → 发现苏辰的秘密"],
  },
  {
    id: "ch-5",
    title: "第五章：雨夜的告白",
    summary:
      "文化祭前夜，一场突如其来的大雨将主角和那位特别的人困在了教室里。在雨声的伴奏下，压抑已久的感情终于找到了出口。这是一个关键的转折点。",
    isKeyNode: true,
    branchTriggers: ["告白 → 进入恋爱结局", "保持沉默 → 继续故事"],
  },
]

export default function OutlinePage() {
  const params = useParams()
  const projectId = params.id as string
  const [chapters, setChapters] = useState<MockChapter[]>(mockChapters)
  const [synopsis, setSynopsis] = useState(
    "一个关于成长、友情与初恋的青春故事。主角在新的学期中遇到了性格迥异的两位重要人物——温柔害羞的文学少女林小樱，和神秘腹黑的学生会长苏辰。在日常的校园生活中，主角需要做出各种选择，这些选择将引领故事走向不同的结局..."
  )
  const [endingCount, setEndingCount] = useState("3")
  const [generating, setGenerating] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

  const handleGenerateOutline = async () => {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    // Mock - in real app would call AI API
    setGenerating(false)
  }

  const handleRegenerateChapter = async (id: string) => {
    setRegeneratingId(id)
    await new Promise((r) => setTimeout(r, 1500))
    setRegeneratingId(null)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updated = [...chapters]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    setChapters(updated)
  }

  const handleMoveDown = (index: number) => {
    if (index === chapters.length - 1) return
    const updated = [...chapters]
    ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
    setChapters(updated)
  }

  const handleDelete = (id: string) => {
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }

  const handleAddChapter = () => {
    const newChapter: MockChapter = {
      id: `ch-${Date.now()}`,
      title: `第${chapters.length + 1}章：新章节`,
      summary: "章节内容待填充...",
      isKeyNode: false,
      branchTriggers: [],
    }
    setChapters((prev) => [...prev, newChapter])
  }

  return (
    <ProjectLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Story Synopsis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              故事梗概
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              rows={4}
              placeholder="输入你的故事核心梗概，AI 将基于此生成章节大纲..."
            />
            <div className="flex items-center gap-4">
              <div className="space-y-1.5 flex-1 max-w-[200px]">
                <Label className="text-xs">结局数量</Label>
                <Select value={endingCount} onValueChange={setEndingCount}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">单结局</SelectItem>
                    <SelectItem value="2">双结局</SelectItem>
                    <SelectItem value="3">多结局 (3+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleGenerateOutline}
                disabled={generating || !synopsis}
                variant="outline"
                className="mt-auto"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    AI 生成大纲中...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    生成章节大纲
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chapter List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-purple-500" />
              章节大纲 ({chapters.length})
            </h3>
            <Button size="sm" variant="outline" onClick={handleAddChapter}>
              <Plus className="h-3.5 w-3.5" />
              新增章节
            </Button>
          </div>

          <div className="space-y-3">
            {chapters.map((chapter, index) => (
              <Card
                key={chapter.id}
                className={`overflow-hidden ${
                  chapter.isKeyNode ? "border-purple-500/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Order Controls */}
                    <div className="flex flex-col gap-0.5 pt-1">
                      <button
                        onClick={() => handleMoveUp(index)}
                        className="p-0.5 rounded hover:bg-accent"
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      <span className="text-xs text-center text-muted-foreground font-mono">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => handleMoveDown(index)}
                        className="p-0.5 rounded hover:bg-accent"
                        disabled={index === chapters.length - 1}
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Input
                          value={chapter.title}
                          onChange={(e) => {
                            const updated = chapters.map((c) =>
                              c.id === chapter.id ? { ...c, title: e.target.value } : c
                            )
                            setChapters(updated)
                          }}
                          className="h-7 text-sm font-medium border-none bg-transparent px-0 focus-visible:ring-0"
                        />
                        {chapter.isKeyNode && (
                          <Badge className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none shrink-0">
                            关键节点
                          </Badge>
                        )}
                      </div>
                      <Textarea
                        value={chapter.summary}
                        onChange={(e) => {
                          const updated = chapters.map((c) =>
                            c.id === chapter.id ? { ...c, summary: e.target.value } : c
                          )
                          setChapters(updated)
                        }}
                        rows={2}
                        className="text-sm resize-none"
                      />
                      {chapter.branchTriggers.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {chapter.branchTriggers.map((trigger, ti) => (
                            <p
                              key={ti}
                              className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1"
                            >
                              <GitBranch className="h-3 w-3" />
                              {trigger}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRegenerateChapter(chapter.id)}
                        disabled={regeneratingId === chapter.id}
                      >
                        {regeneratingId === chapter.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500"
                        onClick={() => handleDelete(chapter.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${projectId}/characters`}>
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Link>
          </Button>
          <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
            <Link href={`/dashboard/projects/${projectId}/dialogue`}>
              下一步：对话编辑 <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </ProjectLayout>
  )
}
