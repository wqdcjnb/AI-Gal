'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  BookOpen,
  Film,
  Users,
  Clock,
  MoreHorizontal,
  Settings,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { STYLE_LABELS, SETTING_LABELS, STRUCTURE_LABELS, STATUS_CONFIG, type GameProject } from './dashboard-config';

const mockProjects: GameProject[] = [];

// Cover gradients for projects without cover images - softer for light theme
const COVER_GRADIENTS = [
  'from-pink-200/60 via-rose-100/40 to-violet-200/60',
  'from-blue-200/60 via-indigo-100/40 to-purple-200/60',
  'from-amber-200/60 via-orange-100/40 to-rose-200/60',
  'from-emerald-200/60 via-teal-100/40 to-cyan-200/60',
  'from-violet-200/60 via-purple-100/40 to-fuchsia-200/60',
];

// Style-specific cover icons
const STYLE_ICONS: Record<string, string> = {
  '萌系': '🌸',
  '泣系': '💧',
  '郁系': '🌑',
  '燃系': '🔥',
  '恋爱喜剧': '💕',
  '纯爱': '❤️',
  '剧情向': '📖',
  '悬疑推理': '🔍',
  '恐怖猎奇': '👁',
  '电波系': '📡',
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<GameProject[]>(mockProjects);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GameProject | null>(null);
  const [settingsTarget, setSettingsTarget] = useState<GameProject | null>(null);

  // 加载项目：先显示缓存，后台从 API 刷新
  useEffect(() => {
    // 1. 先显示缓存的项目（即时渲染）
    const cached: GameProject[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("project-")) {
        try {
          const data = JSON.parse(localStorage.getItem(key)!)
          if (data.id && data.name) {
            cached.push({
              id: data.id,
              name: data.name,
              style: data.emotionStyle || "恋爱喜剧",
              setting: data.themeBackground || "校园",
              structure: data.narrativeStructure || "分支叙事",
              synopsis: data.synopsis || "",
              cover_url: null,
              chapter_count: data.chapterCount || 6,
              status: "editing",
              created_at: "",
              updated_at: "",
              chapterCount: data.chapterCount || 6,
              sceneCount: 0,
              characterCount: 0,
            })
          }
        } catch {}
      }
    }
    if (cached.length > 0) {
      const cachedIds = new Set(cached.map(p => p.id))
      const filteredMock = mockProjects.filter(p => !cachedIds.has(p.id))
      setProjects([...cached, ...filteredMock])
      setLoading(false)
    }

    // 2. 后台从 API 刷新最新数据
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.length > 0) {
          const apiProjects: GameProject[] = json.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            style: p.emotion_style,
            setting: p.theme_background,
            structure: p.narrative_structure,
            synopsis: p.synopsis || "",
            cover_url: p.cover_url,
            chapter_count: p.chapter_count,
            status: p.status,
            created_at: new Date(p.created_at).toISOString(),
            updated_at: new Date(p.updated_at).toISOString(),
            chapterCount: p.chapter_count,
            sceneCount: 0,
            characterCount: 0,
          }))
          // 同步到 localStorage
          for (const p of apiProjects) {
            const existing = localStorage.getItem(`project-${p.id}`)
            const editorData = existing ? JSON.parse(existing) : { chapters: [] }
            editorData.id = p.id
            editorData.name = p.name
            editorData.emotionStyle = p.style
            editorData.themeBackground = p.setting
            editorData.narrativeStructure = p.structure
            editorData.synopsis = p.synopsis
            editorData.chapterCount = p.chapter_count
            editorData.endings = editorData.endings || []
            localStorage.setItem(`project-${p.id}`, JSON.stringify(editorData))
          }
          const apiIds = new Set(apiProjects.map(p => p.id))
          const filteredMock = mockProjects.filter(p => !apiIds.has(p.id))
          setProjects([...apiProjects, ...filteredMock])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleCreateProject = async (data: { name: string; style: string; setting: string; structure: string; chapterCount: number; synopsis: string; coverUrl: string; coverDisplayUrl: string }) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        emotion_style: data.style,
        theme_background: data.setting,
        narrative_structure: data.structure,
        synopsis: data.synopsis,
        chapter_count: data.chapterCount,
        cover_url: data.coverUrl || null,
      }),
    })
    const json = await res.json()
    if (json.success) {
      const newProject: GameProject = {
        id: json.data.id,
        name: data.name,
        style: data.style,
        setting: data.setting,
        structure: data.structure,
        synopsis: data.synopsis,
        cover_url: data.coverDisplayUrl || data.coverUrl || null,
        chapter_count: data.chapterCount,
        status: 'editing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        chapterCount: data.chapterCount,
        sceneCount: 0,
        characterCount: 0,
      }
      setProjects([newProject, ...projects])
      // 兼容编辑器：编辑器目前仍从 localStorage 读取
      localStorage.setItem(`project-${json.data.id}`, JSON.stringify({
        id: json.data.id, name: data.name, emotionStyle: data.style,
        themeBackground: data.setting, narrativeStructure: data.structure,
        synopsis: data.synopsis, chapterCount: data.chapterCount, chapters: [],
      }))
    }
  }

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-[1600px] px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-pink-400" />
              我的项目
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              创建和管理你的 Galgame 视觉小说
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-500 hover:to-violet-500 text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-pink-300/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            新建项目
          </Button>
        </div>

        {/* Project Grid */}
        {projects.length === 0 ? (
          <EmptyState onCreate={() => setCreateOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 justify-items-center">
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                gradientIndex={index % COVER_GRADIENTS.length}
                onDelete={() => setDeleteTarget(project)}
                onSettings={() => setSettingsTarget(project)}
              />
            ))}
            {/* Add Project Card */}
            <AddProjectCard onClick={() => setCreateOpen(true)} />
          </div>
        )}

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreate={handleCreateProject}
        />

        {/* Delete Confirm Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md bg-white border-pink-100/60 shadow-xl shadow-pink-100/20">
            <DialogHeader>
              <DialogTitle className="text-stone-800">确认删除</DialogTitle>
              <DialogDescription className="text-stone-500">
                确认删除「{deleteTarget?.name}」？所有章节、角色、素材数据将永久删除，此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                className="border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (deleteTarget) {
                    await fetch(`/api/projects?id=${deleteTarget.id}`, { method: "DELETE" })
                    localStorage.removeItem(`project-${deleteTarget.id}`)
                    localStorage.removeItem(`ai-gal-characters-${deleteTarget.id}`)
                    localStorage.removeItem(`ai-gal-combos-${deleteTarget.id}`)
                    setProjects(projects.filter(p => p.id !== deleteTarget.id));
                  }
                  setDeleteTarget(null);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                确认删除
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <SettingsDialog
          project={settingsTarget}
          onClose={() => setSettingsTarget(null)}
          onSave={async (id, data) => {
            const coverUrl = data.coverUrl || (projects.find(p => p.id === id)?.cover_url ?? "")
            const displayUrl = data.coverDisplayUrl || coverUrl
            await fetch("/api/projects", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id,
                name: data.name,
                emotion_style: data.style,
                theme_background: data.setting,
                synopsis: data.synopsis,
                cover_url: coverUrl || null,
              }),
            })
            // 同步到 localStorage（编辑器从 localStorage 读取）
            const saved = localStorage.getItem(`project-${id}`)
            if (saved) {
              const editorData = JSON.parse(saved)
              editorData.name = data.name
              editorData.emotionStyle = data.style
              editorData.themeBackground = data.setting
              editorData.synopsis = data.synopsis
              localStorage.setItem(`project-${id}`, JSON.stringify(editorData))
            }
            setProjects(projects.map(p => {
              if (p.id === id) {
                return { ...p, name: data.name, style: data.style, setting: data.setting, synopsis: data.synopsis, cover_url: displayUrl, updated_at: new Date().toISOString() }
              }
              return p
            }))
            setSettingsTarget(null)
          }}
        />
      </div>
    </TooltipProvider>
  );
}

// ========== Project Card ==========
function ProjectCard({
  project,
  gradientIndex,
  onDelete,
  onSettings,
}: {
  project: GameProject;
  gradientIndex: number;
  onDelete: () => void;
  onSettings: () => void;
}) {
  const router = useRouter();
  const firstStyle = project.style.split(",")[0]?.trim() || project.style
  const styleInfo = STYLE_LABELS[firstStyle];
  const settingInfo = SETTING_LABELS[project.setting];
  const structureInfo = STRUCTURE_LABELS[project.structure];
  const statusInfo = STATUS_CONFIG[project.status];
  const gradient = COVER_GRADIENTS[gradientIndex];
  const icon = STYLE_ICONS[firstStyle] || '🎮';

  const updatedDate = new Date(project.updated_at);
  const [timeAgo, setTimeAgo] = useState('');
  const [tagsOverflow, setTagsOverflow] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeAgo(getTimeAgo(updatedDate));
  }, [updatedDate]);

  useEffect(() => {
    const el = tagsRef.current?.firstChild as HTMLElement;
    if (el) setTagsOverflow(el.scrollWidth > el.clientWidth);
  }, [project.style, project.setting, structureInfo]);

  return (
    <div 
      onClick={() => router.push(`/editor?id=${project.id}`)}
      className="group relative rounded-xl border border-pink-100/60 bg-white overflow-hidden transition-all duration-300 hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/40 hover:-translate-y-1 cursor-pointer max-w-[320px] w-full"
    >
      {/* Cover Image Area */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Actual cover image */}
        {project.cover_url ? (
          <img src={project.cover_url} alt={project.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-40 group-hover:opacity-60 transition-opacity duration-300 group-hover:scale-110 transform">
              {icon}
            </span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color} bg-white/80 backdrop-blur-sm border border-white/50`}>
            {statusInfo.label}
          </span>
        </div>
        {/* Menu button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white/80 backdrop-blur-sm hover:bg-white border border-white/50"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5 text-stone-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-pink-100/60 shadow-lg shadow-pink-100/20">
              <DropdownMenuItem className="cursor-pointer text-stone-700 hover:bg-pink-50 hover:text-pink-600" onClick={(e) => { e.stopPropagation(); onSettings(); }}>
                <Settings className="mr-2 h-3.5 w-3.5" />
                项目设置
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-stone-800 text-base leading-tight truncate group-hover:text-pink-500 transition-colors">
          {project.name}
        </h3>

        {/* Tags — 单行，超出时 hover 自动滚动 */}
        <div ref={tagsRef} className="overflow-hidden">
          <div className={`flex gap-1.5 whitespace-nowrap ${tagsOverflow ? 'group-hover:animate-[marquee_6s_linear_infinite]' : ''}`}>
            {(() => {
              const tags = [
                ...project.style.split(",").filter(Boolean).map(s => ({ text: s.trim(), desc: STYLE_LABELS[s.trim()]?.desc, color: STYLE_LABELS[s.trim()]?.color || 'bg-stone-100 text-stone-600 border-stone-200' })),
                { text: project.setting, desc: settingInfo?.desc, color: settingInfo?.color || 'bg-stone-100 text-stone-600 border-stone-200' },
                { text: structureInfo?.label || '', desc: structureInfo?.desc, color: 'bg-violet-50 text-violet-600 border-violet-200/60' },
              ].filter(t => t.text)
              const renderTags = (dup: boolean) => tags.map((t, i) => (
                <Tooltip key={dup ? `dup-${i}` : i}>
                  <TooltipTrigger asChild>
                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium border shrink-0 ${t.color}`}>{t.text}</span>
                  </TooltipTrigger>
                  {t.desc && <TooltipContent side="top" className="bg-white border-pink-100/60 text-xs shadow-md text-stone-700">{t.desc}</TooltipContent>}
                </Tooltip>
              ))
              return <>{renderTags(false)}{tagsOverflow && renderTags(true)}</>
            })()}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {project.chapterCount ?? 0}章
          </span>
          <span className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            {project.sceneCount ?? 0}场景
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {project.characterCount ?? 0}角色
          </span>
        </div>

        {/* Update time */}
        <div className="flex items-center gap-1 text-[11px] text-stone-400">
          <Clock className="h-3 w-3" />
          {timeAgo}
        </div>
      </div>
    </div>
  );
}

// ========== Add Project Card ==========
function AddProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border-2 border-dashed border-pink-200/60 bg-white/50 aspect-[4/5] flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-lg hover:shadow-pink-100/30"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100 group-hover:border-pink-200 group-hover:from-pink-100 group-hover:to-violet-100 transition-all">
        <Plus className="h-5 w-5 text-stone-400 group-hover:text-pink-400 transition-colors" />
      </div>
      <span className="text-sm text-stone-500 group-hover:text-stone-700 transition-colors">
        新建项目
      </span>
    </button>
  );
}

// ========== Empty State ==========
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-50 to-violet-50 border border-pink-100">
        <span className="text-5xl">🎮</span>
      </div>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">
        创建你的第一个 Galgame
      </h2>
      <p className="text-sm text-stone-500 mb-6 max-w-md">
        AI 将帮助你从创意到成品，自动生成大纲、章节剧情、角色立绘和背景音乐，最终导出为 Ren'Py 可玩格式。
      </p>
      <Button
        onClick={onCreate}
        className="bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-500 hover:to-violet-500 text-white shadow-md shadow-pink-200/50"
      >
        <Plus className="mr-2 h-4 w-4" />
        新建项目
      </Button>
    </div>
  );
}

// ========== Create Project Dialog ==========
function CreateProjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: { name: string; style: string; setting: string; structure: string; chapterCount: number; synopsis: string; coverUrl: string; coverDisplayUrl: string }) => void;
}) {
  const [gameName, setGameName] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedSetting, setSelectedSetting] = useState<string>('');
  const [selectedStructure, setSelectedStructure] = useState<string>('');
  const [chapterCount, setChapterCount] = useState(6);
  const [synopsis, setSynopsis] = useState('');
  const [coverDataUrl, setCoverDataUrl] = useState<string>("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border-pink-100/60 shadow-xl shadow-pink-100/20 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-800 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-400" />
            新建 Galgame 项目
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            设定你的游戏基本信息，AI 将根据这些设定生成内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Game Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              游戏名称 <span className="text-pink-400">*</span>
            </Label>
            <Input
              placeholder="输入你的游戏名称..."
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="bg-stone-50 border-stone-200 focus:border-pink-300 focus:ring-pink-200/50 text-stone-800 placeholder:text-stone-400"
            />
          </div>

          {/* Style - Emotional Tone */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              情感风格 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">决定故事的情绪基调</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(STYLE_LABELS).map(([key, info]) => {
                  const isSelected = selectedStyles.includes(key)
                  return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedStyles(prev => isSelected ? prev.filter(s => s !== key) : [...prev, key])}
                  className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-pink-400 bg-pink-50/80 shadow-sm shadow-pink-100'
                      : 'border-stone-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-400 text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-xl">{info.icon}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-stone-700'}`}>
                    {info.label}
                  </span>
                  <span className="text-[11px] text-stone-400 leading-tight line-clamp-2">{info.desc}</span>
                </button>
              )})}
            </div>
          </div>

          {/* Setting - World Background */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              题材背景 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">决定故事的世界观</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(SETTING_LABELS).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSetting(key)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                    selectedSetting === key
                      ? 'border-pink-400 bg-pink-50/80 shadow-sm shadow-pink-100'
                      : 'border-stone-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                  }`}
                >
                  {selectedSetting === key && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-400 text-white">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className="text-2xl">{info.icon}</span>
                  <span className={`text-sm font-medium ${selectedSetting === key ? 'text-pink-700' : 'text-stone-700'}`}>
                    {info.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Structure - Narrative */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              叙事结构 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">决定故事的分支方式</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(STRUCTURE_LABELS).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedStructure(key)}
                  className={`relative flex items-center gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                    selectedStructure === key
                      ? 'border-pink-400 bg-gradient-to-r from-pink-50/80 to-violet-50/50 shadow-md shadow-pink-100/50'
                      : 'border-stone-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                  }`}
                >
                  {selectedStructure === key && (
                    <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-pink-400 text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl font-bold ${
                    selectedStructure === key 
                      ? 'bg-pink-100 text-pink-500' 
                      : 'bg-stone-100 text-stone-400'
                  }`}>
                    {info.icon}
                  </span>
                  <div className="flex-1">
                    <span className={`text-base font-semibold ${selectedStructure === key ? 'text-pink-700' : 'text-stone-700'}`}>
                      {info.label}
                    </span>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{info.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Count */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              章节数量
              <span className="text-xs text-stone-400 ml-2 font-normal">AI 生成大纲的章节数 (3-18)</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                type="range"
                min={3}
                max={18}
                value={chapterCount}
                onChange={(e) => setChapterCount(Number(e.target.value))}
                className="flex-1 accent-pink-400"
              />
              <span className="text-sm font-mono text-pink-500 w-8 text-center">{chapterCount}</span>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              游戏简介 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">AI 将基于此生成剧情</span>
            </Label>
            <Textarea
              placeholder="简单描述你的故事设定、主角、世界观..."
              maxLength={500}
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="bg-stone-50 border-stone-200 focus:border-pink-300 focus:ring-pink-200/50 resize-none text-stone-800 placeholder:text-stone-400"
            />
            <p className="text-[11px] text-stone-400 text-right">{synopsis.length}/500</p>
          </div>

          {/* Cover Upload (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              作品封面
              <span className="text-xs text-stone-400 ml-2 font-normal">可选，后期可添加</span>
            </Label>
            <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => {
              const f = e.target.files?.[0]; if (f && ['image/png','image/jpeg','image/webp'].includes(f.type)) {
                setCoverPreview(URL.createObjectURL(f));
                // 同时读成 base64 data URL 以便存储
                const reader = new FileReader();
                reader.onload = () => setCoverDataUrl(reader.result as string);
                reader.readAsDataURL(f);
              }
            }} className="hidden" />
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-pink-200">
                <img src={coverPreview} alt="封面" className="w-full aspect-[16/10] object-cover" />
                <button onClick={() => { setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = '' }} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">✕</button>
              </div>
            ) : (
              <div onClick={() => coverInputRef.current?.click()} className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50/50 py-6 cursor-pointer hover:border-pink-200 hover:bg-pink-50/30 transition-all">
                <div className="text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 mx-auto"><Plus className="h-5 w-5 text-pink-400" /></div>
                  <p className="text-sm text-stone-500">点击上传封面图片</p>
                  <p className="text-[11px] text-stone-400 mt-1">支持 JPG、PNG，建议比例 16:10</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            取消
          </Button>
          <Button
            onClick={async () => {
              if (gameName.trim() && selectedStyles.length > 0 && selectedSetting && selectedStructure) {
                let finalCoverUrl = ""
                let coverDisplayUrl = ""
                if (coverDataUrl) {
                  const blob = await fetch(coverDataUrl).then(r => r.blob())
                  const fd = new FormData()
                  fd.append("cover", blob, "cover.png")
                  const uploadRes = await fetch("/api/projects/cover", { method: "POST", body: fd })
                  const uploadJson = await uploadRes.json()
                  if (uploadJson.success) {
                    finalCoverUrl = uploadJson.data.cdnUrl
                    coverDisplayUrl = uploadJson.data.cdnUrl
                  }
                }
                onCreate({ name: gameName.trim(), style: selectedStyles.join(","), setting: selectedSetting, structure: selectedStructure, chapterCount, synopsis, coverUrl: finalCoverUrl, coverDisplayUrl })
                setGameName(''); setSelectedStyles([]); setSelectedSetting(''); setSelectedStructure(''); setChapterCount(6); setSynopsis(''); setCoverPreview(null); setCoverDataUrl("")
              }
              onOpenChange(false);
            }}
            className="bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-500 hover:to-violet-500 text-white shadow-md shadow-pink-200/50"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            创建项目
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========== Settings Dialog ==========
function SettingsDialog({
  project,
  onClose,
  onSave,
}: {
  project: GameProject | null;
  onClose: () => void;
  onSave: (id: string, data: { name: string; style: string; setting: string; synopsis: string; coverUrl: string; coverDisplayUrl: string }) => void;
}) {
  const [name, setName] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedSetting, setSelectedSetting] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverDataUrl, setCoverDataUrl] = useState("")
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setSelectedStyles(project.style.split(",").filter(Boolean))
      setSelectedSetting(project.setting)
      setSynopsis(project.synopsis || '')
      setCoverPreview(project.cover_url || null)
      setCoverDataUrl("")
    }
  }, [project])

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) return
    setCoverPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setCoverDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <Dialog open={!!project} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white border-pink-100/60 shadow-xl shadow-pink-100/20 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-stone-800 flex items-center gap-2">
            <Settings className="h-5 w-5 text-pink-400" />
            项目设置
          </DialogTitle>
          <DialogDescription className="text-stone-500">
            修改项目的基本信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Game Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              游戏名称 <span className="text-pink-400">*</span>
            </Label>
            <Input placeholder="输入你的游戏名称..." value={name} onChange={(e) => setName(e.target.value)}
              className="bg-stone-50 border-stone-200 focus:border-pink-300 focus:ring-pink-200/50 text-stone-800 placeholder:text-stone-400" />
          </div>

          {/* Style */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              情感风格 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">决定故事的情绪基调</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(STYLE_LABELS).map(([key, info]) => {
                  const isSelected = selectedStyles.includes(key)
                  return (
                <button key={key} type="button" onClick={() => setSelectedStyles(prev => isSelected ? prev.filter(s => s !== key) : [...prev, key])}
                  className={`relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                    isSelected ? 'border-pink-400 bg-pink-50/80 shadow-sm shadow-pink-100' : 'border-stone-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                  }`}>
                  {isSelected && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-400 text-white">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <span className="text-xl">{info.icon}</span>
                  <span className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-stone-700'}`}>{info.label}</span>
                  <span className="text-[11px] text-stone-400 leading-tight line-clamp-2">{info.desc}</span>
                </button>
              )})}
            </div>
          </div>

          {/* Setting */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-stone-700">
              题材背景 <span className="text-pink-400">*</span>
              <span className="text-xs text-stone-400 ml-2 font-normal">决定故事的世界观</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(SETTING_LABELS).map(([key, info]) => (
                <button key={key} type="button" onClick={() => setSelectedSetting(key)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-200 ${
                    selectedSetting === key ? 'border-pink-400 bg-pink-50/80 shadow-sm shadow-pink-100' : 'border-stone-200 bg-white hover:border-pink-200 hover:bg-pink-50/30'
                  }`}>
                  {selectedSetting === key && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-400 text-white">
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </span>
                  )}
                  <span className="text-2xl">{info.icon}</span>
                  <span className={`text-sm font-medium ${selectedSetting === key ? 'text-pink-700' : 'text-stone-700'}`}>{info.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              世界观设定 <span className="text-xs text-stone-400 ml-2 font-normal">AI 将基于此生成剧情</span>
            </Label>
            <Textarea placeholder="简单描述你的故事设定、主角、世界观..." maxLength={500} rows={3} value={synopsis} onChange={(e) => setSynopsis(e.target.value)}
              className="bg-stone-50 border-stone-200 focus:border-pink-300 focus:ring-pink-200/50 resize-none text-stone-800 placeholder:text-stone-400" />
            <p className="text-[11px] text-stone-400 text-right">{synopsis.length}/500</p>
          </div>

          {/* Cover Upload (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-stone-700">
              作品封面 <span className="text-xs text-stone-400 ml-2 font-normal">可选，后期可添加</span>
            </Label>
            <input ref={coverInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleCoverSelect} className="hidden" />
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-pink-200">
                <img src={coverPreview} alt="封面预览" className="w-full aspect-[16/10] object-cover" />
                <button onClick={() => { setCoverPreview(null); if (coverInputRef.current) coverInputRef.current.value = '' }} className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">✕</button>
              </div>
            ) : (
              <div onClick={() => coverInputRef.current?.click()} className="flex items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50/50 py-6 cursor-pointer hover:border-pink-200 hover:bg-pink-50/30 transition-all">
                <div className="text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 mx-auto"><Plus className="h-5 w-5 text-pink-400" /></div>
                  <p className="text-sm text-stone-500">点击上传封面图片</p>
                  <p className="text-[11px] text-stone-400 mt-1">支持 JPG、PNG，建议比例 16:10</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
          <Button variant="outline" onClick={onClose} className="border-stone-200 text-stone-600 hover:bg-stone-50">取消</Button>
          <Button onClick={async () => {
            if (!name.trim() || !project) return
            let finalCoverUrl = project.cover_url || ""
            let coverDisplayUrl = ""
            if (coverDataUrl) {
              const blob = await fetch(coverDataUrl).then(r => r.blob())
              const fd = new FormData()
              fd.append("cover", blob, "cover.png")
              const uploadRes = await fetch("/api/projects/cover", { method: "POST", body: fd })
              const uploadJson = await uploadRes.json()
              if (uploadJson.success) {
                finalCoverUrl = uploadJson.data.cdnUrl
                coverDisplayUrl = uploadJson.data.cdnUrl
              }
            }
            onSave(project.id, { name: name.trim(), style: selectedStyles.join(","), setting: selectedSetting, synopsis, coverUrl: finalCoverUrl, coverDisplayUrl })
          }} disabled={!name.trim()}
            className="bg-gradient-to-r from-pink-400 to-violet-400 hover:from-pink-500 hover:to-violet-500 text-white shadow-md shadow-pink-200/50">
            <Sparkles className="mr-2 h-4 w-4" />保存设置</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ========== Helper Functions ==========
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return date.toLocaleDateString('zh-CN');
}
