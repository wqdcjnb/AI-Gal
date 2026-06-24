"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sparkles, Loader2, Play, Pause, UserRound, Image, Music, Film,
  ChevronRight, Edit3, Check, RefreshCw, GitBranch, Plus, Trash2, Eye,
  Upload, Download,
} from "lucide-react"
import Link from "next/link"
import type { ChapterAssets, AssetCharacter, AssetBackground, AssetBgm, AssetCg } from "@/types/project"

// ============================================================
// 模拟数据
// ============================================================

const MOCK_CHAPTERS = [
  { id: "ch-1", title: "序章 - 命运的起点", summary: "主角初次登场，在校园门口邂逅神秘少女。宁静的日常中暗藏伏笔，一个看似偶然的相遇成为整个故事的起点。", isKeyNode: true, branchTriggers: ["是否追赶少女的背影"] },
  { id: "ch-2", title: "初遇 - 交错的道路", summary: "主角与少女再次相遇。新的关系建立，旧友的秘密浮现，选择的第一道岔路口悄然出现。", isKeyNode: true, branchTriggers: ["加入文艺部", "加入科学社"] },
  { id: "ch-3", title: "冲突 - 暗流涌动", summary: "校园文化祭临近，隐藏的矛盾逐渐爆发。主角面临信任与背叛的考验。", isKeyNode: true, branchTriggers: ["相信少女", "独自调查"] },
  { id: "ch-4", title: "转折 - 真相边缘", summary: "追寻线索的过程揭示出惊人的秘密。主角必须在友情与真相之间做出选择。", isKeyNode: true, branchTriggers: ["保护朋友", "揭露真相"] },
  { id: "ch-5", title: "高潮 - 命运的抉择", summary: "所有线索汇聚于文化祭当晚，主角迎来最终考验。情感与理智激烈碰撞。", isKeyNode: true, branchTriggers: ["选择A", "选择B"] },
  { id: "ch-6", title: "尾声 - 新的开始", summary: "故事落下帷幕。回顾一路走来的旅程，角色的成长令人感慨。", isKeyNode: false, branchTriggers: [] },
]

const MOCK_ASSETS_CH1: ChapterAssets = {
  chapterId: "ch-1", chapterTitle: "序章 - 命运的起点",
  characters: [
    { name: "主角", role: "玩家角色", spriteDesc: "校服，深蓝色短发，略显稚嫩的面庞，眼神坚定而好奇", voiceStyle: "清澈、坚定、充满好奇心的少年音", voiceLanguage: "中" },
    { name: "苏晴", role: "神秘少女", spriteDesc: "白色连衣裙，黑色长发及腰，袖口绣有银色花纹，面带温柔的微笑", voiceStyle: "温柔、甜美、略带羞涩的少女音", voiceLanguage: "中" },
    { name: "路人学生A", role: "NPC", spriteDesc: "标准校服，路人装扮，无明显特征", voiceStyle: "普通、平和的女声", voiceLanguage: "中" },
  ],
  backgrounds: [
    { scene: "校园门口", desc: "春日傍晚，夕阳将天空染成橙红色，校门口的樱花树正盛开，花瓣随风飘落" },
    { scene: "樱花大道", desc: "校园主路两侧种满樱花树，花瓣铺成粉色地毯，气氛温馨宁静" },
  ],
  bgm: [
    { mood: "日常", desc: "轻柔的钢琴独奏，节奏舒缓如春风拂过，音符间带着淡淡的怀旧与期待" },
    { mood: "神秘", desc: "弦乐与竖琴交织，旋律若隐若现，营造出命运齿轮开始转动的氛围" },
  ],
  cg: [
    { trigger: "少女在樱花树下回头", desc: "樱花树下的特写镜头。夕阳逆光，花瓣在画面中形成粉色光斑" },
  ],
}

function getChapterAssets(chapterId: string): ChapterAssets {
  if (chapterId === "ch-1") return MOCK_ASSETS_CH1
  const ch = MOCK_CHAPTERS.find((c) => c.id === chapterId)!
  return { chapterId: ch.id, chapterTitle: ch.title, characters: [], backgrounds: [], bgm: [], cg: [] }
}

// ============================================================
// 编辑描述组件
// ============================================================

function EditableDesc({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  useEffect(() => { setText(value) }, [value])

  if (!editing) {
    return (
      <div className="flex-1 flex items-start gap-2 group/desc">
        <span className="text-base text-muted-foreground flex-1">{value || "（空）"}</span>
        <button onClick={() => setEditing(true)} className="shrink-0 opacity-0 group-hover/desc:opacity-100 transition-opacity p-1 rounded hover:bg-accent">
          <Edit3 className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    )
  }
  return (
    <div className="flex-1 flex items-start gap-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} className="text-base min-h-0 h-auto py-1" autoFocus />
      <Button size="sm" variant="ghost" onClick={() => { onChange(text); setEditing(false) }}>
        <Check className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

// ============================================================
// AI 生图（文生图 / 图生图）
// ============================================================

type AssetField = "characters" | "backgrounds" | "bgm" | "cg"
type AssetType = "character" | "background" | "cg" | "bgm"

async function handleGenerate(
  setAssets: React.Dispatch<React.SetStateAction<ChapterAssets>>,
  field: AssetField,
  idx: number,
  assetType: AssetType,
  promptText: string,
  referenceImage?: string,
) {
  setAssets((prev) => {
    const u = { ...prev, [field]: prev[field].map((item: any, i: number) => i === idx ? { ...item, generating: true, candidates: [], generatedUrl: undefined } : item) }
    return u
  })
  try {
    const res = await fetch("/api/ai/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        type: assetType,
        n: field === "bgm" ? 2 : 4,
        referenceImage: referenceImage || undefined,
      }),
    })
    const data = await res.json()
    if (data.success && data.images?.length) {
      setAssets((prev) => {
        const done = { ...prev, [field]: prev[field].map((item: any, i: number) =>
          i === idx ? {
            ...item, generating: false,
            referenceImage: undefined,
            candidates: data.images.map((img: any) => ({ url: img.url, selected: false })),
          } : item
        )}
        return done
      })
    } else {
      setAssets((prev) => {
        const done = { ...prev, [field]: prev[field].map((item: any, i: number) =>
          i === idx ? { ...item, generating: false } : item
        )}
        return done
      })
    }
  } catch (err) {
    console.error("Image generation error:", err)
    setAssets((prev) => {
      const done = { ...prev, [field]: prev[field].map((item: any, i: number) =>
        i === idx ? { ...item, generating: false } : item
      )}
      return done
    })
  }
}

/** 读取 File 为 base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** 高亮选中候选图，同时左侧缩略图即时预览 */
function selectCandidate(setAssets: React.Dispatch<React.SetStateAction<ChapterAssets>>, field: AssetField, idx: number, candidateIdx: number) {
  setAssets((prev) => {
    const done = { ...prev, [field]: prev[field].map((item: any, i: number) =>
      i === idx ? {
        ...item,
        generatedUrl: item.candidates[candidateIdx].url,
        candidates: item.candidates.map((c: any, j: number) => ({ ...c, selected: j === candidateIdx })),
      } : item
    )}
    return done
  })
}

/** 确认选择，清除候选列表（generatedUrl 已由 selectCandidate 写入） */
function confirmCandidate(setAssets: React.Dispatch<React.SetStateAction<ChapterAssets>>, field: AssetField, idx: number) {
  setAssets((prev) => {
    const done = { ...prev, [field]: prev[field].map((item: any, i: number) =>
      i === idx ? { ...item, candidates: undefined } : item
    )}
    return done
  })
}

// ============================================================
// 下拉+自定义输入组合字段
// ============================================================

function ComboField({ label, options, value, onChange }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  const [custom, setCustom] = useState(false)
  const CUSTOM_KEY = "__custom__"

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={custom ? CUSTOM_KEY : (value || CUSTOM_KEY)}
        onValueChange={(v) => {
          if (v === CUSTOM_KEY) { setCustom(true); onChange("") }
          else { setCustom(false); onChange(v) }
        }}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="请选择..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
          <SelectItem value={CUSTOM_KEY}>✚ 自定义...</SelectItem>
        </SelectContent>
      </Select>
      {custom && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`输入${label}...`}
          className="mt-1.5"
          autoFocus
        />
      )}
    </div>
  )
}

// ============================================================
// 新增对话框
// ============================================================

function AddDialog({ open, onOpenChange, field, onAdd, onEdit, editIndex, editData, characters }: {
  open: boolean; onOpenChange: (o: boolean) => void; field: AssetField; onAdd: (data: any) => void
  onEdit?: (index: number, data: any) => void
  editIndex?: number | null
  editData?: Record<string, string> | null
  characters: AssetCharacter[]
}) {
  const isEdit = editIndex != null && editData != null
  const editTitles: Record<string, string> = { characters: "编辑人物", backgrounds: "编辑背景", bgm: "编辑BGM", cg: "编辑CG" }
  const addTitles: Record<string, string> = { characters: "添加人物", backgrounds: "添加背景", bgm: "添加BGM", cg: "添加CG" }
  const labels: Record<AssetField, { title: string; fields: { key: string; label: string }[] }> = {
    characters: { title: isEdit ? editTitles.characters : addTitles.characters, fields: [{ key: "name", label: "名称" }, { key: "role", label: "身份" }, { key: "spriteDesc", label: "立绘描述" }] },
    backgrounds: { title: isEdit ? editTitles.backgrounds : addTitles.backgrounds, fields: [{ key: "scene", label: "场景名" }, { key: "desc", label: "场景描述" }] },
    bgm: { title: isEdit ? editTitles.bgm : addTitles.bgm, fields: [{ key: "mood", label: "情绪标签" }, { key: "desc", label: "音乐描述" }] },
    cg: { title: isEdit ? editTitles.cg : addTitles.cg, fields: [{ key: "trigger", label: "触发时机" }, { key: "desc", label: "画面描述" }] },
  }
  const info = labels[field]
  const [form, setForm] = useState<Record<string, string>>(isEdit ? { ...editData } : {})
  useEffect(() => { setForm(isEdit ? { ...editData } : {}) }, [open, editIndex])

  // 提取已有名称/身份用于下拉
  const existingNames = [...new Set(characters.map((c) => c.name).filter(Boolean))]
  const existingRoles = [...new Set(characters.map((c) => c.role).filter(Boolean))]

  const handleSubmit = () => {
    if (isEdit && onEdit && editIndex != null) {
      onEdit(editIndex, form)
    } else {
      onAdd(form)
    }
    setForm({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{info.title}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-4">
          {info.fields.map((f) => {
            if (field === "characters" && f.key === "name") {
              return (
                <ComboField
                  key={f.key}
                  label={f.label}
                  options={existingNames}
                  value={form.name || ""}
                  onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                />
              )
            }
            if (field === "characters" && f.key === "role") {
              return (
                <ComboField
                  key={f.key}
                  label={f.label}
                  options={existingRoles}
                  value={form.role || ""}
                  onChange={(v) => setForm((p) => ({ ...p, role: v }))}
                />
              )
            }
            return (
              <div key={f.key} className="space-y-1.5">
                <Label>{f.label}</Label>
                <Input value={form[f.key] || ""} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit}>{isEdit ? "保存" : "添加"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// 图片预览
// ============================================================

function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1">
        <Eye className="h-3 w-3" />预览
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" onClick={() => setOpen(false)}>
          <img src={url} alt={alt} className="max-w-[80vw] max-h-[80vh] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

// ============================================================
// 音频播放
// ============================================================

function AudioPlayer({ url }: { url: string }) {
  const [playing, setPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const toggle = () => {
    if (playing) {
      audio?.pause()
      setPlaying(false)
      return
    }
    const a = new Audio(url)
    a.onended = () => setPlaying(false)
    a.play()
    setAudio(a)
    setPlaying(true)
  }

  return (
    <button onClick={toggle} className="text-xs text-amber-500 hover:text-amber-600 flex items-center gap-1">
      {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
      {playing ? "暂停" : "播放"}
    </button>
  )
}

// ============================================================
// 主页面
// ============================================================

export default function ChaptersPage() {
  const params = useParams()
  const projectId = params.id as string

  const [selectedChapter, setSelectedChapter] = useState("ch-1")
  const [chapters, setChapters] = useState(MOCK_CHAPTERS)
  const [assets, setAssets] = useState<ChapterAssets>(getChapterAssets("ch-1"))
  const [genAllLoading, setGenAllLoading] = useState(false)
  const [addDialog, setAddDialog] = useState<{ open: boolean; field: AssetField }>({ open: false, field: "characters" })
  const [editDialog, setEditDialog] = useState<{ open: boolean; field: AssetField; index: number; data: Record<string, string> } | null>(null)

  const currentChapter = chapters.find((c) => c.id === selectedChapter)!

  const updateChapter = (id: string, key: string, value: any) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)))
  }

  const handleAnalyzeChapter = async () => {
    setGenAllLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setAssets(getChapterAssets(selectedChapter))
    setGenAllLoading(false)
  }

  const handleAdd = (data: any) => {
    const field = addDialog.field
    setAssets((prev) => ({ ...prev, [field]: [...prev[field], data] }))
  }

  const handleEditItem = (field: AssetField, index: number, data: any) => {
    setAssets((prev) => {
      const arr = [...prev[field]]
      arr[index] = { ...arr[index], ...data }
      return { ...prev, [field]: arr }
    })
  }

  const handleUploadRef = async (field: AssetField, index: number, file: File) => {
    const base64 = await fileToBase64(file)
    setAssets((prev) => {
      const arr = [...prev[field]]
      arr[index] = { ...arr[index], referenceImage: base64 }
      return { ...prev, [field]: arr }
    })
  }

  const handleDelete = (field: AssetField, idx: number): void => {
    setAssets((prev) => ({ ...prev, [field]: (prev[field] as any[]).filter((_: any, i: number) => i !== idx) }))
  }

  const updateField = (field: AssetField, idx: number, key: string, value: string) => {
    setAssets((prev) => {
      const arr = [...prev[field]]
      arr[idx] = { ...arr[idx], [key]: value }
      return { ...prev, [field]: arr }
    })
  }

  useEffect(() => { setAssets(getChapterAssets(selectedChapter)) }, [selectedChapter])

  return (
    <ProjectLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* 左侧：章节列表 */}
        <div className="w-52 shrink-0 space-y-3 overflow-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">章节列表</h2>
            <Button size="sm" variant="ghost" onClick={handleAnalyzeChapter} disabled={genAllLoading}>
              {genAllLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              AI分析
            </Button>
          </div>
          <div className="space-y-1">
            {chapters.map((ch) => (
              <button key={ch.id} onClick={() => setSelectedChapter(ch.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                  selectedChapter === ch.id
                    ? "bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-medium"
                    : "hover:bg-accent border border-transparent"
                }`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{ch.id.split("-")[1]}</span>
                  <span className="truncate">{ch.title}</span>
                  {ch.isKeyNode && <GitBranch className="h-3 w-3 text-amber-500 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
          <div className="pt-4 border-t space-y-2">
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href={`/dashboard/projects/${projectId}`}>← 返回基础信息</Link>
            </Button>
            <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none" asChild>
              <Link href={`/dashboard/projects/${projectId}/dialogue`}>
                下一步：对话编辑 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 右侧：资产工作区 */}
        <div className="flex-1 overflow-auto space-y-4">
          {/* 章节概要 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                <EditableInline
                  value={currentChapter.title}
                  onChange={(v) => updateChapter(currentChapter.id, "title", v)}
                  className="text-lg font-semibold"
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentChapter.summary}
                onChange={(e) => updateChapter(currentChapter.id, "summary", e.target.value)}
                rows={3}
                className="text-base resize-none"
              />
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <GitBranch className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                {currentChapter.branchTriggers.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1">
                    <Input
                      value={b}
                      onChange={(e) => {
                        const updated = [...currentChapter.branchTriggers]
                        updated[i] = e.target.value
                        updateChapter(currentChapter.id, "branchTriggers", updated)
                      }}
                      className="h-7 w-32 text-xs"
                    />
                    <button
                      onClick={() => {
                        const updated = currentChapter.branchTriggers.filter((_, j) => j !== i)
                        updateChapter(currentChapter.id, "branchTriggers", updated)
                      }}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    const updated = [...currentChapter.branchTriggers, "新分支"]
                    updateChapter(currentChapter.id, "branchTriggers", updated)
                  }}
                >
                  <Plus className="h-3 w-3 mr-0.5" />添加
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 👤 人物 */}
          <AssetSection
            title="人物" icon={<UserRound className="h-4 w-4 text-purple-500" />}
            items={assets.characters}

            nameKey="name"
            subKey="role"
            descKey="spriteDesc"
            showPreview
            field="characters" setAssets={setAssets}
            onAdd={() => setAddDialog({ open: true, field: "characters" })}
            onDelete={(i) => handleDelete("characters", i)}
            onDescChange={(i, v) => updateField("characters", i, "spriteDesc", v)}
            onNameChange={(i, v) => updateField("characters", i, "name", v)}
            onRoleChange={(i, v) => updateField("characters", i, "role", v)}
            onGenerate={(i) => { const item = assets.characters[i]; handleGenerate(setAssets, "characters", i, "character", item.spriteDesc || item.name, (item as any).referenceImage) }}
            onEditItem={(i, item) => setEditDialog({ open: true, field: "characters", index: i, data: { name: item.name, role: item.role || "", spriteDesc: item.spriteDesc || "" } })}
            onUploadRef={(i, file) => handleUploadRef("characters", i, file)}
          />

          {/* 🖼️ 背景 */}
          <AssetSection
            title="背景" icon={<Image className="h-4 w-4 text-sky-500" />}
            items={assets.backgrounds}
            
            nameKey="scene"
            descKey="desc"
            showPreview
            field="backgrounds" setAssets={setAssets}
            onAdd={() => setAddDialog({ open: true, field: "backgrounds" })}
            onDelete={(i) => handleDelete("backgrounds", i)}
            onDescChange={(i, v) => updateField("backgrounds", i, "desc", v)}
            onNameChange={(i, v) => updateField("backgrounds", i, "scene", v)}
            onGenerate={(i) => { const item = assets.backgrounds[i]; handleGenerate(setAssets, "backgrounds", i, "background", item.desc || item.scene, (item as any).referenceImage) }}
            onEditItem={(i, item) => setEditDialog({ open: true, field: "backgrounds", index: i, data: { scene: item.scene, desc: item.desc || "" } })}
            onUploadRef={(i, file) => handleUploadRef("backgrounds", i, file)}
          />

          {/* 🎵 BGM */}
          <AssetSection
            title="BGM" icon={<Music className="h-4 w-4 text-amber-500" />}
            items={assets.bgm}
            
            nameKey="mood"
            descKey="desc"
            showAudio
            field="bgm" setAssets={setAssets}
            onAdd={() => setAddDialog({ open: true, field: "bgm" })}
            onDelete={(i) => handleDelete("bgm", i)}
            onDescChange={(i, v) => updateField("bgm", i, "desc", v)}
            onNameChange={(i, v) => updateField("bgm", i, "mood", v)}
            onGenerate={(i) => { const item = assets.bgm[i]; handleGenerate(setAssets, "bgm", i, "bgm", item.desc || item.mood) }}
          />

          {/* ✨ CG */}
          <AssetSection
            title="CG" icon={<Film className="h-4 w-4 text-rose-500" />}
            items={assets.cg}
            
            nameKey="trigger"
            descKey="desc"
            showPreview
            field="cg" setAssets={setAssets}
            onAdd={() => setAddDialog({ open: true, field: "cg" })}
            onDelete={(i) => handleDelete("cg", i)}
            onDescChange={(i, v) => updateField("cg", i, "desc", v)}
            onNameChange={(i, v) => updateField("cg", i, "trigger", v)}
            onGenerate={(i) => { const item = assets.cg[i]; handleGenerate(setAssets, "cg", i, "cg", item.desc || item.trigger) }}
          />
        </div>
      </div>

      <AddDialog open={addDialog.open} onOpenChange={(o) => setAddDialog((p) => ({ ...p, open: o }))} field={addDialog.field} onAdd={handleAdd} characters={assets.characters} />
      {editDialog && (
        <AddDialog
          open={editDialog.open}
          onOpenChange={(o) => { if (!o) setEditDialog(null) }}
          field={editDialog.field}
          onAdd={handleAdd}
          onEdit={(index, data) => handleEditItem(editDialog.field, index, data)}
          editIndex={editDialog.index}
          editData={editDialog.data}
          characters={assets.characters}
        />
      )}
    </ProjectLayout>
  )
}

// ============================================================
// 通用资产区块组件
// ============================================================

function AssetSection({ title, icon, items, nameKey, subKey, descKey, showPreview, showAudio, field, setAssets, onAdd, onDelete, onDescChange, onNameChange, onRoleChange, onGenerate, onEditItem, onUploadRef }: {
  title: string; icon: React.ReactNode; items: any[]; nameKey: string; subKey?: string; descKey: string
  showPreview?: boolean; showAudio?: boolean; field: AssetField
  setAssets: React.Dispatch<React.SetStateAction<ChapterAssets>>
  onAdd: () => void; onDelete: (i: number) => void
  onDescChange: (i: number, v: string) => void; onNameChange: (i: number, v: string) => void
  onRoleChange?: (i: number, v: string) => void; onGenerate: (i: number) => void
  onEditItem?: (i: number, item: any) => void
  onUploadRef?: (i: number, file: File) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">{icon}{title}</CardTitle>
          <Button size="sm" variant="ghost" onClick={onAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />添加
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <p className="text-base text-muted-foreground text-center py-4">暂无{title}，点击「添加」手动创建</p>
        )}
        {items.map((item, i) => {
          const iconColors: Record<string, string> = { "人物": "bg-purple-500/10", "背景": "bg-sky-500/10", "BGM": "bg-amber-500/10", "CG": "bg-rose-500/10" }
          const placeholders: Record<string, string> = {
            "人物": "https://placehold.co/100x140/e9d5ff/7c3aed?text=Character",
            "背景": "https://placehold.co/160x90/e0f2fe/0284c7?text=Background",
            "CG": "https://placehold.co/160x90/fce7f3/e11d48?text=CG",
          }
          const hasImage = item.generatedUrl && (showPreview || title === "人物" || title === "背景" || title === "CG")
          return (
            <div key={i} className="rounded-lg border border-border hover:border-purple-500/30 transition-colors">
              <div className="flex items-start gap-3 p-3">
                {/* 缩略图 */}
                {showPreview || title === "人物" || title === "背景" || title === "CG" ? (
                  <div className="relative shrink-0 group/thumb">
                    <div className={`h-20 w-16 rounded-lg ${iconColors[title] || "bg-muted"} flex items-center justify-center overflow-hidden`}>
                      {(item as any).referenceImage ? (
                        <img src={(item as any).referenceImage} alt="参考图" className="h-full w-full object-cover" />
                      ) : item.generatedUrl ? (
                        <img src={item.generatedUrl} alt={item[nameKey]} className="h-full w-full object-cover cursor-pointer" />
                      ) : (
                        <img src={placeholders[title] || placeholders["人物"]} alt="placeholder" className="h-full w-full object-cover opacity-50" />
                      )}
                    </div>
                    {/* 上传参考图按钮（人物/背景） */}
                    {(field === "characters" || field === "backgrounds") && onUploadRef && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-4 w-4 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (file) onUploadRef(i, file)
                            e.target.value = ""
                          }}
                        />
                      </label>
                    )}
                    {(item as any).referenceImage && (
                      <Badge className="absolute -bottom-1 -right-1 text-[9px] h-3.5 px-1 bg-amber-500 text-white border-none">参考</Badge>
                    )}
                  </div>
                ) : (
                  <div className={`h-10 w-10 rounded-lg ${iconColors[title] || "bg-muted"} flex items-center justify-center shrink-0`}>
                    {icon}
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {nameKey === "trigger" ? (
                      <span className="text-base font-medium">CG：{field === "characters" || field === "backgrounds" ? <span>{item[nameKey]}</span> : <EditableInline value={item[nameKey]} onChange={(v) => onNameChange(i, v)} />}</span>
                    ) : field === "characters" || field === "backgrounds" ? (
                      <span className="text-base font-medium">{item[nameKey]}</span>
                    ) : (
                      <EditableInline value={item[nameKey]} onChange={(v) => onNameChange(i, v)} className="text-base font-medium" />
                    )}
                    {subKey && onRoleChange && (
                      field === "characters" ? (
                        <span className="text-xs text-muted-foreground">{item[subKey] || ""}</span>
                      ) : (
                        <EditableInline value={item[subKey] || ""} onChange={(v) => onRoleChange(i, v)} className="text-xs text-muted-foreground" />
                      )
                    )}
                    {item.generatedUrl && <Badge variant="secondary" className="text-[11px] h-4">已选择</Badge>}
                  </div>
                  {field === "characters" || field === "backgrounds" ? (
                    <span className="text-base text-muted-foreground">{item[descKey] || "（空）"}</span>
                  ) : (
                    <EditableDesc value={item[descKey] || ""} onChange={(v) => onDescChange(i, v)} />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.generatedUrl && showAudio && <AudioPlayer url={item.generatedUrl} />}
                  <Button size="sm" variant="outline" onClick={() => onGenerate(i)} disabled={item.generating}>
                    {item.generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {item.generatedUrl ? "重新生成" : "AI生成"}
                  </Button>
                  {onEditItem && (field === "characters" || field === "backgrounds") && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-purple-500" onClick={() => onEditItem(i, item)} title="编辑">
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {item.generatedUrl && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-purple-500"
                      title="下载"
                      onClick={async () => {
                        try {
                          const res = await fetch(item.generatedUrl)
                          const blob = await res.blob()
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement("a")
                          a.href = url
                          a.download = `${item[nameKey] || "image"}.png`
                          a.click()
                          URL.revokeObjectURL(url)
                        } catch { window.open(item.generatedUrl, "_blank") }
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => onDelete(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* 候选图片选择区 */}
              {item.candidates && item.candidates.length > 0 && (
                <div className="px-3 pb-3 border-t border-border/50">
                  <div className="flex items-center justify-between mt-2 mb-2">
                    <p className="text-xs text-muted-foreground">选择一个你满意的：</p>
                    {/* 确认选择按钮 */}
                    {item.candidates.some((c: any) => c.selected) && (
                      <Button
                        size="sm"
                        className="h-7 text-xs bg-purple-500 hover:bg-purple-600 text-white"
                        onClick={() => confirmCandidate(setAssets, field, i)}
                      >
                        <Check className="h-3 w-3 mr-1" />确认选择
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {item.candidates.map((c: any, ci: number) => (
                      <button key={ci}
                        onClick={() => selectCandidate(setAssets, field, i, ci)}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                          c.selected ? "border-purple-500 shadow-md" : "border-transparent hover:border-purple-500/50"
                        } ${title === "人物" ? "w-18 h-26" : title === "BGM" ? "w-auto px-3 py-2" : "w-32 h-20"}`}>
                        {showAudio ? (
                          <span className="text-sm">{c.url.split("/").pop()?.replace(".mp3", "")}</span>
                        ) : (
                          <img src={c.url} alt={`候选 ${ci + 1}`} className="h-full w-full object-cover" />
                        )}
                        {c.selected && (
                          <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* 上传参考图重新生成 */}
                  {(field === "characters" || field === "backgrounds") && (
                    <label className="inline-flex items-center gap-1 mt-2 text-[11px] text-muted-foreground hover:text-purple-500 cursor-pointer transition-colors">
                      <Upload className="h-3 w-3" />
                      上传参考图重新生成
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          e.target.value = ""
                          onUploadRef?.(i, file)
                          // 上传后立即触发生成
                          const base64 = await fileToBase64(file)
                          const promptText = field === "characters"
                            ? (item.spriteDesc || item.name)
                            : (item.desc || item.scene || item.mood || item.trigger)
                          const assetType = field === "characters" ? "character" : field === "backgrounds" ? "background" : field === "cg" ? "cg" : "bgm"
                          handleGenerate(setAssets, field, i, assetType, promptText, base64)
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

// 内联编辑
function EditableInline({ value, onChange, className }: { value: string; onChange: (v: string) => void; className?: string }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(value)
  useEffect(() => { setText(value) }, [value])

  if (!editing) {
    return (
      <span className={`${className || ""} cursor-pointer hover:text-purple-500 transition-colors`} onClick={() => setEditing(true)} title="点击编辑">
        {value || "（空）"}
      </span>
    )
  }
  return (
    <input
      value={text} onChange={(e) => setText(e.target.value)}
      onBlur={() => { onChange(text); setEditing(false) }}
      onKeyDown={(e) => { if (e.key === "Enter") { onChange(text); setEditing(false) } }}
      className="border-b border-purple-500 bg-transparent outline-none text-sm px-1 w-auto min-w-[60px]"
      autoFocus
    />
  )
}
