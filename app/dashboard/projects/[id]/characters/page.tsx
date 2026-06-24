"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  UserRound,
  Plus,
  Sparkles,
  Loader2,
  Trash2,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Palette,
  Mic,
  Play,
  Pause,
  Lock,
  Volume2,
} from "lucide-react"
import Link from "next/link"

// Mock character data
interface MockCharacter {
  id: string
  name: string
  identity: string
  tags: string[]
  description: string
  position: string
  colorNote: string
  voiceStyle: string
  voiceName?: string      // designVoice 返回的固定声型ID，一旦设置则声型锁定
  voicePreviewUrl?: string // 生成时的试听音频（base64）
  sprites: { type: string; expression: string; url: string }[]
}

const mockCharacters: MockCharacter[] = [
  {
    id: "char-1",
    name: "林小樱",
    identity: "高中二年级学生，文学社成员",
    tags: ["温柔", "善良", "害羞", "文艺"],
    description:
      "林小樱是私立樱丘高中的二年级学生，担任文学社的副社长。她有着一头及肩的柔顺黑发，琥珀色的眼眸总是带着一丝温柔的笑意。性格内向害羞但内心坚强，喜欢在放学后独自待在图书馆的角落看书。有着不为人知的秘密——她其实是一位在网上小有名气的小说作者。",
    position: "左",
    colorNote: "粉色系为主，白色为辅，体现温柔气质",
    voiceStyle: "温柔、甜美、略带羞涩的少女音",
    sprites: [
      { type: "正装", expression: "微笑", url: "" },
      { type: "正装", expression: "害羞", url: "" },
      { type: "日常", expression: "微笑", url: "" },
      { type: "Q版", expression: "开心", url: "" },
    ],
  },
  {
    id: "char-2",
    name: "苏辰",
    identity: "高中三年级学生，学生会会长",
    tags: ["冷静", "腹黑", "学霸", "神秘"],
    description:
      "苏辰是樱丘高中三年级的学生会会长，成绩常年年级第一。银灰色的碎发下是一双深邃的紫色眼眸，总是带着一种看透一切的了然。表面待人温和有礼，实则腹黑且善于谋划。很少提及自己的过去，传闻他来自一个古老的家族。",
    position: "右",
    colorNote: "深蓝/紫色系为主，体现神秘冷静的气质",
    voiceStyle: "低沉、温柔、偶尔带着一丝戏谑的男声",
    sprites: [
      { type: "正装", expression: "微笑", url: "" },
      { type: "正装", expression: "腹黑", url: "" },
      { type: "日常", expression: "冷淡", url: "" },
      { type: "Q版", expression: "傲娇", url: "" },
    ],
  },
]

const positions = ["左", "中", "右"]

export default function CharactersPage() {
  const params = useParams()
  const projectId = params.id as string
  const [characters, setCharacters] = useState<MockCharacter[]>(mockCharacters)
  const [selectedChar, setSelectedChar] = useState<MockCharacter | null>(mockCharacters[0] || null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [newChar, setNewChar] = useState({ name: "", identity: "", tags: "" })

  // 配音相关状态
  const [voiceGenerating, setVoiceGenerating] = useState<string | null>(null) // charId
  const [voicePlaying, setVoicePlaying] = useState<string | null>(null) // charId
  const [voiceAudio, setVoiceAudio] = useState<HTMLAudioElement | null>(null)

  const handleGenerateCharacter = async () => {
    if (!newChar.name) return
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2000))
    const char: MockCharacter = {
      id: `char-${Date.now()}`,
      name: newChar.name,
      identity: newChar.identity || "待补充身份信息",
      tags: newChar.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: `这是关于${newChar.name}的角色设定。${newChar.identity ? `身份为${newChar.identity}。` : ""}详细的人物背景、性格特点和外貌描述将由 AI 进一步生成...`,
      position: "中",
      colorNote: "",
      voiceStyle: "",
      sprites: [
        { type: "正装", expression: "微笑", url: "" },
        { type: "日常", expression: "微笑", url: "" },
      ],
    }
    setCharacters((prev) => [...prev, char])
    setSelectedChar(char)
    setShowNewDialog(false)
    setNewChar({ name: "", identity: "", tags: "" })
    setGenerating(false)
  }

  const handleDeleteCharacter = (id: string) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id))
    if (selectedChar?.id === id) {
      setSelectedChar(characters.find((c) => c.id !== id) || null)
    }
  }

  const handleRegenerateSprite = (charId: string, spriteIndex: number) => {
    // Mock regeneration
    const updated = characters.map((c) => {
      if (c.id === charId) {
        const sprites = [...c.sprites]
        sprites[spriteIndex] = { ...sprites[spriteIndex], url: `regenerated-${Date.now()}` }
        return { ...c, sprites }
      }
      return c
    })
    setCharacters(updated)
    if (selectedChar?.id === charId) {
      setSelectedChar(updated.find((c) => c.id === charId) || null)
    }
  }

  const handleRegenerateAllSprites = (charId: string) => {
    const updated = characters.map((c) => {
      if (c.id === charId) {
        return {
          ...c,
          sprites: c.sprites.map((s) => ({ ...s, url: `regenerated-${Date.now()}` })),
        }
      }
      return c
    })
    setCharacters(updated)
    if (selectedChar?.id === charId) {
      setSelectedChar(updated.find((c) => c.id === charId) || null)
    }
  }

  // ============================================================
  // 配音相关
  // ============================================================

  const handleDesignVoice = async (charId: string) => {
    const char = characters.find((c) => c.id === charId)
    if (!char || !char.voiceStyle) return

    setVoiceGenerating(charId)
    try {
      const res = await fetch("/api/ai/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "design",
          prompt: char.voiceStyle,
          previewText: `你好，我是${char.name}`,
          name: `${char.name}_voice`,
        }),
      })
      const data = await res.json()
      if (data.success) {
        const updated = characters.map((c) =>
          c.id === charId
            ? { ...c, voiceName: data.voiceName, voicePreviewUrl: data.audioUrl }
            : c
        )
        setCharacters(updated)
        setSelectedChar((prev) =>
          prev?.id === charId
            ? { ...prev, voiceName: data.voiceName, voicePreviewUrl: data.audioUrl }
            : prev
        )
      } else {
        console.error("Voice design failed:", data.message)
      }
    } catch (err) {
      console.error("Voice design error:", err)
    } finally {
      setVoiceGenerating(null)
    }
  }

  const handlePreviewVoice = (charId: string) => {
    const char = characters.find((c) => c.id === charId)
    if (!char?.voicePreviewUrl) return

    // 停止当前播放
    if (voiceAudio) {
      voiceAudio.pause()
      setVoiceAudio(null)
      setVoicePlaying(null)
    }

    // 如果已经在播放同一个，则停止
    if (voicePlaying === charId) {
      setVoicePlaying(null)
      return
    }

    const audio = new Audio(char.voicePreviewUrl)
    audio.onended = () => {
      setVoicePlaying(null)
      setVoiceAudio(null)
    }
    audio.onerror = () => {
      setVoicePlaying(null)
      setVoiceAudio(null)
    }
    audio.play().catch(console.error)
    setVoiceAudio(audio)
    setVoicePlaying(charId)
  }

  // 停止播放（切换角色或卸载时）
  const stopVoice = () => {
    if (voiceAudio) {
      voiceAudio.pause()
      setVoiceAudio(null)
      setVoicePlaying(null)
    }
  }

  return (
    <ProjectLayout>
      <div className="flex gap-6">
        {/* Left: Character List */}
        <div className="w-64 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">角色列表</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            {characters.map((char) => (
              <button
                key={char.id}
                onClick={() => { stopVoice(); setSelectedChar(char) }}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  selectedChar?.id === char.id
                    ? "bg-foreground text-background"
                    : "hover:bg-accent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserRound className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium truncate">{char.name}</span>
                </div>
                <p className="text-xs mt-0.5 truncate opacity-70">{char.identity}</p>
              </button>
            ))}
            {characters.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                暂无角色，点击 + 新增
              </p>
            )}
          </div>
        </div>

        {/* Right: Character Detail */}
        <div className="flex-1 min-w-0">
          {selectedChar ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-purple-500" />
                    {selectedChar.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteCharacter(selectedChar.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedChar.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Textarea
                    value={selectedChar.description}
                    onChange={(e) => {
                      const updated = characters.map((c) =>
                        c.id === selectedChar.id ? { ...c, description: e.target.value } : c
                      )
                      setCharacters(updated)
                      setSelectedChar((prev) => (prev ? { ...prev, description: e.target.value } : null))
                    }}
                    rows={4}
                    className="text-sm"
                  />
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">出场位置</Label>
                      <Select
                        value={selectedChar.position}
                        onValueChange={(v: string) => {
                          const updated = characters.map((c) =>
                            c.id === selectedChar.id ? { ...c, position: v } : c
                          )
                          setCharacters(updated)
                          setSelectedChar((prev) => (prev ? { ...prev, position: v } : null))
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Palette className="h-3 w-3" /> 配色备注
                      </Label>
                      <Input
                        value={selectedChar.colorNote}
                        onChange={(e) => {
                          const updated = characters.map((c) =>
                            c.id === selectedChar.id ? { ...c, colorNote: e.target.value } : c
                          )
                          setCharacters(updated)
                          setSelectedChar((prev) => (prev ? { ...prev, colorNote: e.target.value } : null))
                        }}
                        className="h-8 text-xs"
                        placeholder="粉色系..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1">
                        <Mic className="h-3 w-3" /> 配音风格
                      </Label>
                      {selectedChar.voiceName ? (
                        <div className="flex items-center gap-1.5 h-8 px-2 rounded-md border border-purple-500/30 bg-purple-500/5">
                          <Lock className="h-3 w-3 text-purple-500 shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{selectedChar.voiceStyle}</span>
                        </div>
                      ) : (
                        <Input
                          value={selectedChar.voiceStyle}
                          onChange={(e) => {
                            const updated = characters.map((c) =>
                              c.id === selectedChar.id ? { ...c, voiceStyle: e.target.value } : c
                            )
                            setCharacters(updated)
                            setSelectedChar((prev) => (prev ? { ...prev, voiceStyle: e.target.value } : null))
                          }}
                          className="h-8 text-xs"
                          placeholder="温柔少女音..."
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 配音管理 */}
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-purple-500" />
                    配音管理
                  </CardTitle>
                  {selectedChar.voiceName && (
                    <Badge variant="secondary" className="text-[11px] gap-1">
                      <Lock className="h-3 w-3" />
                      声型已锁定
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* 声型状态提示 */}
                  {!selectedChar.voiceName && !selectedChar.voiceStyle && (
                    <p className="text-sm text-muted-foreground">
                      填写上方的「配音风格」描述后，点击下方按钮让 AI 为该角色设计专属声型。声型一旦生成将<b>固定</b>，后续对话中只需调整语气即可。
                    </p>
                  )}
                  {!selectedChar.voiceName && selectedChar.voiceStyle && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                      <p className="text-sm">
                        已填写配音风格：<span className="font-medium text-amber-600 dark:text-amber-400">「{selectedChar.voiceStyle}」</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        点击生成后，AI 将根据此描述创建固定声型。生成后声型不可修改，仅可调整语气。
                      </p>
                    </div>
                  )}
                  {selectedChar.voiceName && (
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">声型已固定</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        声型描述：{selectedChar.voiceStyle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        声型ID：<code className="text-[11px] bg-muted px-1 rounded">{selectedChar.voiceName}</code>
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        此声型已与「{selectedChar.name}」绑定。在对话编辑中，将使用此声型为该角色的每句台词配音，只需选择语气（傲娇/温柔/冷淡等）即可。
                      </p>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    {!selectedChar.voiceName ? (
                      <Button
                        size="sm"
                        onClick={() => handleDesignVoice(selectedChar.id)}
                        disabled={!selectedChar.voiceStyle || voiceGenerating === selectedChar.id}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                      >
                        {voiceGenerating === selectedChar.id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                            AI 生成声型中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5 mr-1" />
                            AI 生成声型
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewVoice(selectedChar.id)}
                        className="text-purple-600 border-purple-500/30"
                      >
                        {voicePlaying === selectedChar.id ? (
                          <>
                            <Pause className="h-3.5 w-3.5 mr-1" />
                            停止试听
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            试听声型
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* 提示 */}
                  {selectedChar.voiceName && (
                    <p className="text-[11px] text-muted-foreground">
                      💡 声型已锁定。如需更改，请删除当前角色后重新创建，或联系开发者在后续版本中支持重新生成。
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Sprites */}
              <Card>
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-purple-500" />
                    角色立绘
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleRegenerateAllSprites(selectedChar.id)}
                    >
                      <RefreshCw className="h-3 w-3" />
                      全部重绘
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      <Upload className="h-3 w-3" />
                      上传替换
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {selectedChar.sprites.map((sprite, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border overflow-hidden group"
                      >
                        <div className="aspect-[3/4] bg-gradient-to-b from-purple-500/10 to-pink-500/10 flex items-center justify-center relative">
                          <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                          <button
                            className="absolute top-2 right-2 p-1 rounded-md bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRegenerateSprite(selectedChar.id, idx)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="p-2 text-center">
                          <p className="text-xs font-medium">{sprite.type}</p>
                          <p className="text-[10px] text-muted-foreground">{sprite.expression}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/projects/${projectId}`}>
                    <ChevronLeft className="h-4 w-4" /> 上一步
                  </Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
                  <Link href={`/dashboard/projects/${projectId}/outline`}>
                    下一步：剧情大纲 <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <UserRound className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">选择一个角色或创建新角色</p>
            </div>
          )}
        </div>
      </div>

      {/* New Character Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增角色</DialogTitle>
            <DialogDescription>输入基本信息，AI 将自动生成人设和立绘。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>角色姓名 *</Label>
              <Input
                value={newChar.name}
                onChange={(e) => setNewChar((p) => ({ ...p, name: e.target.value }))}
                placeholder="例如：林小樱"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>身份 / 职业</Label>
              <Input
                value={newChar.identity}
                onChange={(e) => setNewChar((p) => ({ ...p, identity: e.target.value }))}
                placeholder="例如：高中二年级学生，文学社成员"
              />
            </div>
            <div className="space-y-2">
              <Label>性格标签（用逗号分隔）</Label>
              <Input
                value={newChar.tags}
                onChange={(e) => setNewChar((p) => ({ ...p, tags: e.target.value }))}
                placeholder="例如：温柔, 善良, 害羞, 文艺"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              取消
            </Button>
            <Button
              onClick={handleGenerateCharacter}
              disabled={!newChar.name || generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI 生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI 生成角色
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProjectLayout>
  )
}
