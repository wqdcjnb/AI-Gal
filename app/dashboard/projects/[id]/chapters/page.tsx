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
  Upload, Download, Volume2,
} from "lucide-react"
import Link from "next/link"
import type { ChapterAssets, AssetCharacter, AssetBackground, AssetBgm, AssetCg } from "@/types/project"

// ============================================================
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
    const endpoint = "/api/ai/image";
    const res = await fetch(endpoint, {
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

function ComboField({ label, options, value, onChange, onCustomSelected, onSelect }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void
  onCustomSelected?: () => void
  onSelect?: (v: string) => void
}) {
  const [custom, setCustom] = useState(false)
  const CUSTOM_KEY = "__custom__"

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select
        value={custom ? CUSTOM_KEY : (value || CUSTOM_KEY)}
        onValueChange={(v) => {
          if (v === CUSTOM_KEY) { setCustom(true); onChange(""); onCustomSelected?.() }
          else { setCustom(false); onChange(v); onSelect?.(v) }
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

function AddDialog({ open, onOpenChange, field, onAdd, onEdit, editIndex, editData, assets, customOptions, onCustomAdd }: {
  open: boolean; onOpenChange: (o: boolean) => void; field: AssetField; onAdd: (data: any) => void
  onEdit?: (index: number, data: any) => void
  editIndex?: number | null
  editData?: Record<string, string> | null
  assets?: ChapterAssets
  customOptions?: Record<string, Record<string, string>[]>
  onCustomAdd?: (field: AssetField, data: Record<string, string>) => void
  onCustomDelete?: (field: AssetField, name: string) => void
  onCustomEdit?: (field: AssetField, oldName: string, newName: string) => void
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

  // 各类型的主字段已有值列表
  const customNames = (customOptions?.characters || []).map((c: any) => c.name).filter(Boolean)
  const customRoles = (customOptions?.characters || []).map((c: any) => c.role).filter(Boolean)
  const existingNames = [...new Set([...(assets?.characters || []).map((c: any) => c.name), ...customNames].filter(Boolean))]
  const existingRoles = [...new Set([...(assets?.characters || []).map((c: any) => c.role), ...customRoles].filter(Boolean))]
  const existingScenes = [...new Set([...(assets?.backgrounds || []).map((b: any) => b.scene), ...(customOptions?.backgrounds || []).map((c: any) => c.scene)].filter(Boolean))]
  const existingMoods = [...new Set([...(assets?.bgm || []).map((b: any) => b.mood), ...(customOptions?.bgm || []).map((c: any) => c.mood)].filter(Boolean))]
  const existingTriggers = [...new Set([...(assets?.cg || []).map((c: any) => c.trigger), ...(customOptions?.cg || []).map((c: any) => c.trigger)].filter(Boolean))]

  // 各类型的主字段 key → options 映射
  const comboFields: Record<string, { options: string[]; formKey: string }> = {
    characters_name: { options: existingNames, formKey: "name" },
    characters_role: { options: existingRoles, formKey: "role" },
    backgrounds_scene: { options: existingScenes, formKey: "scene" },
    bgm_mood: { options: existingMoods, formKey: "mood" },
    cg_trigger: { options: existingTriggers, formKey: "trigger" },
  }

  // 各类型的主字段和描述字段
  const mainFieldKey: Record<string, string> = { characters: "name", backgrounds: "scene", bgm: "mood", cg: "trigger" }
  const descFieldKey: Record<string, string> = { characters: "spriteDesc", backgrounds: "desc", bgm: "desc", cg: "desc" }

  // 选中已有选项时，自动填充对应资产的完整信息
  const handleSelectExisting = (selectedValue: string) => {
    const items = (assets as any)?.[field] || []
    const mainKey = mainFieldKey[field] || ""
    const matched = items.find((item: any) => (item[mainKey] || item.name || item.scene || item.mood || item.trigger) === selectedValue)
    const cOpts = customOptions?.[field] || []
    const customMatch = cOpts.find((c: any) => c[mainKey] === selectedValue)
    const source = matched || customMatch
    if (!source) return
    setForm(source)
  }

  const handleSubmit = () => {
    if (isEdit && onEdit && editIndex != null) {
      // 主字段值不在已有选项中 → 仅加入下拉，不修改资产
      const mainKey = mainFieldKey[field] || ""
      const mainOpts = comboFields[`${field}_${mainKey}`]?.options || []
      if (form[mainKey] && !mainOpts.includes(form[mainKey])) {
        onCustomAdd?.(field, { ...form })
      } else {
        onEdit(editIndex, form)
      }
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
            const comboKey = `${field}_${f.key}`;
            const combo = comboFields[comboKey];
            if (combo) {
              return (
                <ComboField
                  key={f.key}
                  label={f.label}
                  options={combo.options}
                  value={form[combo.formKey] || ""}
                  onChange={(v) => setForm((p) => ({ ...p, [combo.formKey]: v }))}
                  onSelect={(v) => handleSelectExisting(v)}
                  onCustomSelected={() => {
                    const descKey = descFieldKey[field]
                    if (descKey) setForm((p) => ({ ...p, [descKey]: "" }))
                  }}
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

  const [selectedChapter, setSelectedChapter] = useState("")
  const [chapters, setChapters] = useState<any[]>([])
  const [assets, setAssets] = useState<ChapterAssets>({ chapterId: "", chapterTitle: "", characters: [], backgrounds: [], bgm: [], cg: [] })
  const [genAllLoading, setGenAllLoading] = useState(false)
  const [addDialog, setAddDialog] = useState<{ open: boolean; field: AssetField }>({ open: false, field: "characters" })
  const [editDialog, setEditDialog] = useState<{ open: boolean; field: AssetField; index: number; data: Record<string, string> } | null>(null)
  const [customOptions, setCustomOptions] = useState<Record<string, Record<string, string>[]>>({})

  const handleCustomAdd = (field: AssetField, data: Record<string, string>) => {
    const mainKey: Record<string, string> = { characters: "name", backgrounds: "scene", bgm: "mood", cg: "trigger" }
    const key = mainKey[field] || "name"
    const name = data[key]
    if (!name) return
    setCustomOptions((prev) => {
      const list = prev[field] || []
      const idx = list.findIndex((c) => c[key] === name)
      if (idx >= 0) {
        const updated = [...list]; updated[idx] = data; return { ...prev, [field]: updated }
      }
      return { ...prev, [field]: [...list, data] }
    })
  }

  const handleCustomDelete = (field: AssetField, name: string) => {
    // 从 assets 中删除匹配项
    const mainKey: Record<string, string> = { characters: "name", backgrounds: "scene", bgm: "mood", cg: "trigger" }
    const key = mainKey[field] || "name"
    setAssets((prev) => {
      const arr = prev[field].filter((item: any) => item[key] !== name)
      return { ...prev, [field]: arr }
    })
    // 从 customOptions 中删除
    setCustomOptions((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((c) => c[key] !== name),
    }))
  }

  const handleCustomEdit = (field: AssetField, oldName: string, newName: string) => {
    const mainKey: Record<string, string> = { characters: "name", backgrounds: "scene", bgm: "mood", cg: "trigger" }
    const key = mainKey[field] || "name"
    // 更新 assets 中匹配项的名称
    setAssets((prev) => {
      const arr = prev[field].map((item: any) => item[key] === oldName ? { ...item, [key]: newName } : item)
      return { ...prev, [field]: arr }
    })
    // 更新 customOptions 中匹配项的名称
    setCustomOptions((prev) => ({
      ...prev,
      [field]: (prev[field] || []).map((c) => c[key] === oldName ? { ...c, [key]: newName } : c),
    }))
  }

  const currentChapter = chapters.find((c) => c.id === selectedChapter) || null

  // 从 DB 加载章节，若无则从大纲解析
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/db/chapters?projectId=${projectId}`)
        const data = await res.json()
        if (data.success && data.chapters?.length) {
          setChapters(data.chapters.map((c: any) => ({ id: c._id, title: c.title, summary: c.summary, isKeyNode: c.isKeyNode, branchTriggers: c.branchTriggers })))
          const first = data.chapters[0]
          setSelectedChapter(first._id)
          setAssets(first.assets || { chapterId: first._id, chapterTitle: first.title, characters: [], backgrounds: [], bgm: [], cg: [] })
          return
        }
        // 无章节 → 从项目大纲解析
        const projRes = await fetch(`/api/db/projects/${projectId}`)
        const projData = await projRes.json()
        const outline = projData.project?.worldSetting || ""
        if (!outline) return

        // 解析大纲中的章节标题：【第X章：标题】或【第X章:标题】
        const pattern = /【第(\d+)章[：:](.*?)】/g
        const matches = [...outline.matchAll(pattern)]
        if (!matches.length) return

        // 提取分支点（★分支点：xxx / 分支点：xxx / 关键分支：xxx）
        const branchPattern = /(?:★分支点|分支点|关键分支|分支)[：:]\s*(.+)/g
        const allBranches = [...outline.matchAll(branchPattern)].map((m) => m[1].trim())

        const parsedChapters = matches.map((m, i) => {
          const start = (m.index || 0) + m[0].length
          const end = i + 1 < matches.length ? matches[i + 1].index : outline.length
          const text = outline.slice(start, end)
            .replace(/【.*?】/g, "")
            .replace(/★.*?$/gm, "")
            .replace(/\n{2,}/g, "\n")
            .trim()
          const summary = text.slice(0, 150).replace(/\n/g, " ").trim() || "章节内容待填充..."
          return {
            id: `ch-${i + 1}`,
            title: `第${m[1]}章：${m[2]}`,
            summary,
            isKeyNode: i < matches.length - 1,
            branchTriggers: i < allBranches.length ? [allBranches[i]] : [] as string[],
          }
        })
        setChapters(parsedChapters)
        setSelectedChapter(parsedChapters[0].id)
        setAssets({ chapterId: parsedChapters[0].id, chapterTitle: parsedChapters[0].title, characters: [], backgrounds: [], bgm: [], cg: [] })
        saveChapters(parsedChapters, { chapterId: parsedChapters[0].id, chapterTitle: parsedChapters[0].title, characters: [], backgrounds: [], bgm: [], cg: [] })
      } catch {}
    })()
  }, [])

  // 保存章节到 DB
  const saveChapters = async (chs: any[], asts: ChapterAssets) => {
    const docs = chs.map((ch) => ({
      _id: ch.id,
      projectId,
      title: ch.title,
      summary: ch.summary,
      isKeyNode: ch.isKeyNode,
      branchTriggers: ch.branchTriggers,
      assets: ch.id === asts.chapterId ? asts : undefined,
      updatedAt: new Date().toISOString(),
    }))
    fetch("/api/db/chapters", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(docs) }).catch(() => {})
  }

  const handleDeleteChapter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    // 从 DB 删除
    await fetch(`/api/db/chapters/${id}`, { method: "DELETE" }).catch(() => {})
    if (selectedChapter === id) {
      const remaining = chapters.filter((c) => c.id !== id)
      const next = remaining[0]
      setSelectedChapter(next?.id || "")
      setAssets(next ? { chapterId: next.id, chapterTitle: next.title, characters: [], backgrounds: [], bgm: [], cg: [] } : { chapterId: "", chapterTitle: "", characters: [], backgrounds: [], bgm: [], cg: [] })
    }
    setChapters((prev) => prev.filter((c) => c.id !== id))
  }

  const handleAddChapter = () => {
    const num = chapters.length + 1
    const id = `ch-${num}`
    const newChapter = { id, title: `第${num}章：新章节`, summary: "", isKeyNode: false, branchTriggers: [] as string[] }
    setChapters((prev) => {
      const next = [...prev, newChapter]
      saveChapters(next, assets)
      return next
    })
    setSelectedChapter(id)
    setAssets({ chapterId: id, chapterTitle: newChapter.title, characters: [], backgrounds: [], bgm: [], cg: [] })
  }

  const updateChapter = (id: string, key: string, value: any) => {
    setChapters((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, [key]: value } : c))
      saveChapters(next, assets)
      return next
    })
  }

  const handleAnalyzeChapter = async () => {
    if (!currentChapter) return
    setGenAllLoading(true)
    try {
      const res = await fetch("/api/ai/chapter-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: { title: currentChapter.title, summary: currentChapter.summary },
        }),
      })
      const data = await res.json()
      if (data.success && data.assets) {
        const newAssets = {
          chapterId: currentChapter.id,
          chapterTitle: currentChapter.title,
          characters: data.assets.characters || [],
          backgrounds: data.assets.backgrounds || [],
          bgm: data.assets.bgm || [],
          cg: data.assets.cg || [],
        }
        setAssets(newAssets)
        saveChapters(chapters, newAssets)
      }
    } catch (err) { console.error("AI 分析失败:", err) }
    finally { setGenAllLoading(false) }
  }

  const handleAdd = (data: any) => {
    const field = addDialog.field
    setAssets((prev) => ({ ...prev, [field]: [...prev[field], data] }))
  }

  // 更新 assets 并自动保存
  const updateAssets = (updater: (prev: ChapterAssets) => ChapterAssets) => {
    setAssets((prev) => {
      const next = updater(prev)
      saveChapters(chapters, next)
      return next
    })
  }

  const handleEditItem = (field: AssetField, index: number, data: any) => {
    updateAssets((prev) => {
      const arr = [...prev[field]]
      arr[index] = { ...arr[index], ...data }
      return { ...prev, [field]: arr }
    })
  }

  // 各类型快速添加
  const makeQuickAddOptions = (field: AssetField, key: string) => [...new Set([
    ...assets[field].map((c: any) => c[key]),
    ...(customOptions[field] || []).map((c: any) => c[key]),
  ].filter(Boolean))]

  const handleQuickAdd = (field: AssetField, key: string, name: string) => {
    const existing = (assets[field] as any[]).find((c: any) => c[key] === name)
      || (customOptions[field] || []).find((c: any) => c[key] === name)
    const item: any = { [key]: name }
    if (field === "characters") {
      item.role = (existing as any)?.role || ""
      item.spriteDesc = (existing as any)?.spriteDesc || ""
      item.voiceStyle = (existing as any)?.voiceStyle || ""
      item.voiceLanguage = (existing as any)?.voiceLanguage || "中"
    } else {
      item.desc = (existing as any)?.desc || ""
    }
    setAssets((prev) => ({ ...prev, [field]: [...prev[field], item] }))
  }

  const handleUploadRef = async (field: AssetField, index: number, file: File) => {
    const base64 = await fileToBase64(file)
    setAssets((prev) => {
      const assets = prev[field] as any[]
      const arr = [...assets]
      ;(arr[index] as any).referenceImage = base64
      return { ...prev, [field]: arr as any }
    })
  }

  const handleUploadBgm = async (index: number, file: File) => {
    const base64 = await fileToBase64(file)
    try {
      const res = await fetch("/api/upload/temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      })
      const data = await res.json()
      if (data.success && data.url) {
        setAssets((prev) => {
          const arr = [...prev.bgm]
          arr[index] = { ...arr[index], generatedUrl: data.url }
          return { ...prev, bgm: arr }
        })
      }
    } catch (err) { console.error("BGM upload error:", err) }
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

  return (
    <ProjectLayout>
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        {/* 左侧：章节列表 */}
        <div className="w-52 shrink-0 space-y-3 overflow-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">章节列表</h2>
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={handleAnalyzeChapter} disabled={genAllLoading || !currentChapter} title="AI 分析生成资产">
                {genAllLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-purple-500" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleAddChapter} title="添加章节">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            {chapters.map((ch) => (
              <div key={ch.id} className="flex items-center gap-0.5 group/ch">
                <button onClick={() => setSelectedChapter(ch.id)}
                  className={`flex-1 text-left px-3 py-2.5 rounded-lg text-base transition-colors ${
                    selectedChapter === ch.id
                      ? "bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 font-medium"
                      : "hover:bg-accent border border-transparent"
                  }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{ch.id.replace(/ch-/, "")}</span>
                    <span className="truncate">{ch.title}</span>
                  </div>
                </button>
                <button
                  onClick={(e) => handleDeleteChapter(ch.id, e)}
                  className="opacity-0 group-hover/ch:opacity-100 text-muted-foreground hover:text-red-500 shrink-0 p-1"
                  title="删除章节"
                ><Trash2 className="h-3 w-3" /></button>
              </div>
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
          {!currentChapter ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <p className="text-muted-foreground">选择一个章节或点击 + 创建新章节</p>
              </div>
            </div>
          ) : (<>
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
                className="text-base"
              />
              {currentChapter.branchTriggers.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <GitBranch className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  {currentChapter.branchTriggers.map((b: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">{b}</Badge>
                  ))}
                </div>
              )}
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
            quickAddOptions={makeQuickAddOptions("characters", "name")}
            onQuickAdd={(name) => handleQuickAdd("characters", "name", name)}
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
            quickAddOptions={makeQuickAddOptions("backgrounds", "scene")}
            onQuickAdd={(name) => handleQuickAdd("backgrounds", "scene", name)}
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
            quickAddOptions={makeQuickAddOptions("bgm", "mood")}
            onQuickAdd={(name) => handleQuickAdd("bgm", "mood", name)}
            onDelete={(i) => handleDelete("bgm", i)}
            onDescChange={(i, v) => updateField("bgm", i, "desc", v)}
            onNameChange={(i, v) => updateField("bgm", i, "mood", v)}
            onUploadBgm={(i, file) => handleUploadBgm(i, file)}
            onEditItem={(i, item) => setEditDialog({ open: true, field: "bgm", index: i, data: { mood: item.mood, desc: item.desc || "" } })}
          />

          {/* ✨ CG */}
          <AssetSection
            title="CG" icon={<Film className="h-4 w-4 text-rose-500" />}
            items={assets.cg}

            nameKey="trigger"
            descKey="desc"
            showPreview
            field="cg" setAssets={setAssets}
            quickAddOptions={makeQuickAddOptions("cg", "trigger")}
            onQuickAdd={(name) => handleQuickAdd("cg", "trigger", name)}
            onDelete={(i) => handleDelete("cg", i)}
            onDescChange={(i, v) => updateField("cg", i, "desc", v)}
            onNameChange={(i, v) => updateField("cg", i, "trigger", v)}
            onEditItem={(i, item) => setEditDialog({ open: true, field: "cg", index: i, data: { trigger: item.trigger, desc: item.desc || "" } })}
            onUploadRef={(i, file) => handleUploadRef("cg", i, file)}
          />
        </>)}
        </div>
      </div>
      <AddDialog open={addDialog.open} onOpenChange={(o) => setAddDialog((p) => ({ ...p, open: o }))} field={addDialog.field} onAdd={handleAdd} assets={assets} customOptions={customOptions} onCustomAdd={handleCustomAdd} onCustomDelete={handleCustomDelete} onCustomEdit={handleCustomEdit} />
      {editDialog && (
        <AddDialog
          open={editDialog.open}
          onOpenChange={(o) => { if (!o) setEditDialog(null) }}
          field={editDialog.field}
          onAdd={handleAdd}
          onEdit={(index, data) => handleEditItem(editDialog.field, index, data)}
          editIndex={editDialog.index}
          editData={editDialog.data}
          assets={assets}
          customOptions={customOptions}
          onCustomAdd={handleCustomAdd}
        />
      )}
    </ProjectLayout>
  )
}

// ============================================================
// 通用资产区块组件
// ============================================================

function AssetSection({ title, icon, items, nameKey, subKey, descKey, showPreview, showAudio, field, setAssets, onAdd, onDelete, onDescChange, onNameChange, onRoleChange, onGenerate, onEditItem, onUploadRef, onUploadBgm, quickAddOptions, onQuickAdd }: {
  title: string; icon: React.ReactNode; items: any[]; nameKey: string; subKey?: string; descKey: string
  showPreview?: boolean; showAudio?: boolean; field: AssetField
  setAssets: React.Dispatch<React.SetStateAction<ChapterAssets>>
  onAdd?: () => void; onDelete: (i: number) => void
  onDescChange: (i: number, v: string) => void; onNameChange: (i: number, v: string) => void
  onRoleChange?: (i: number, v: string) => void; onGenerate?: (i: number) => void
  onEditItem?: (i: number, item: any) => void
  onUploadRef?: (i: number, file: File) => void
  onUploadBgm?: (i: number, file: File) => void
  quickAddOptions?: string[]
  onQuickAdd?: (value: string) => void
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">{icon}{title}</CardTitle>
          {quickAddOptions ? (
            <Select onValueChange={(v) => onQuickAdd?.(v)} value="">
              <SelectTrigger className="h-8 w-auto gap-1 text-xs border-0 hover:bg-accent">
                <Plus className="h-3.5 w-3.5" />添加
              </SelectTrigger>
              <SelectContent>
                {quickAddOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Button size="sm" variant="ghost" onClick={onAdd}>
              <Plus className="h-3.5 w-3.5 mr-1" />添加
            </Button>
          )}
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
                    {/* 上传图片按钮（人物/背景/CG） */}
                    {(onEditItem != null) && onUploadRef && (
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
                  <div className="relative shrink-0 group/thumb">
                    <div className={`h-10 w-10 rounded-lg ${iconColors[title] || "bg-muted"} flex items-center justify-center shrink-0`}>
                      {item.generatedUrl && showAudio ? (
                        <Volume2 className="h-5 w-5 text-amber-500" />
                      ) : (
                        icon
                      )}
                    </div>
                    {/* BGM 上传按钮 */}
                    {field === "bgm" && onUploadBgm && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover/thumb:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="h-3.5 w-3.5 text-white" />
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) onUploadBgm(i, file)
                            e.target.value = ""
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {nameKey === "trigger" ? (
                      <span className="text-base font-medium">CG：{onEditItem != null ? <span>{item[nameKey]}</span> : <EditableInline value={item[nameKey]} onChange={(v) => onNameChange(i, v)} />}</span>
                    ) : onEditItem != null ? (
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
                  {onEditItem != null ? (
                    <span className="text-base text-muted-foreground">{item[descKey] || "（空）"}</span>
                  ) : (
                    <EditableDesc value={item[descKey] || ""} onChange={(v) => onDescChange(i, v)} />
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {item.generatedUrl && showAudio && <AudioPlayer url={item.generatedUrl} />}
                  <Button size="sm" variant="outline" onClick={() => onGenerate?.(i)} disabled={item.generating}>
                    {item.generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {item.generatedUrl ? "重新生成" : "AI生成"}
                  </Button>
                  {onEditItem && (
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
                          const ext = field === "bgm" ? ".mp3" : ".png"
                          a.download = `${item[nameKey] || "image"}${ext}`
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
                  {/* 上传参考图重新生成（仅人物/背景） */}
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
