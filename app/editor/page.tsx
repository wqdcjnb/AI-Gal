'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Users,
  Image,
  Play,
  Download,
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  Check,
  X,
  Edit3,
  MapPin,
  Flag,
  GitBranch,
  List,
  Network,
  MessageSquare,
  Music,
  ImageIcon,
  ChevronRight,
  GripVertical,
  User,
  Quote,
  HelpCircle,
  Settings,
  Upload,
  Search,
  Volume2,
  Music2,
  Layers,
  Eye,
  Film,
  Mic,
  FolderOpen,
  GitMerge,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
interface KeyPoint {
  id: string
  title: string
  description: string
  background: string
  scene: string
}

interface Chapter {
  id: string
  number: number
  title: string
  scenes: string[]
  keyPoints: KeyPoint[]
  route?: 'common' | 'a' | 'b' | 'c' | 'true'
  endingType?: 'HE' | 'NE' | 'BE' | 'TE'
  branchFrom?: string
}

interface ProjectData {
  id: string
  name: string
  emotionStyle: string
  themeBackground: string
  narrativeStructure: string
  synopsis: string
  chapterCount: number
  chapters: Chapter[]
}

// Tabs
const tabs = [
  { id: 'outline', label: '大纲', icon: FileText },
  { id: 'chapter', label: '章节', icon: BookOpen },
  { id: 'characters', label: '角色', icon: Users },
  { id: 'asset', label: '素材', icon: Image },
]

// Types for Chapter Editor
interface ChoiceEffect {
  type: 'affection' | 'flag'
  target: string
  value: number | boolean
  operator: 'set' | 'add' | 'subtract'
}

interface ChoiceOption {
  text: string
  targetSubSectionId: string
  type?: 'normal' | 'hidden' | 'timed'
  functionType?: 'branch' | 'affection' | 'flavor' | 'trap'
  condition?: string
  timeout?: number
  effects?: ChoiceEffect[]
  isBadEnd?: boolean
}

interface DialogueLine {
  id: string
  type: 'narration' | 'dialogue' | 'choice'
  characterId?: string
  characterName?: string
  content: string
  spriteId?: string
  spriteExpression?: string
  bgmChange?: string
  soundEffect?: string
  cgTrigger?: string
  textSpeed?: 'slow' | 'normal' | 'fast'
  screenEffect?: 'none' | 'shake' | 'flash_white' | 'flash_black'
  choices?: ChoiceOption[]
}

interface SubSection {
  id: string
  title: string
  background: string
  bgm: string
  dialogues: DialogueLine[]
  isBranch?: boolean
  branchFrom?: string
  isMergePoint?: boolean
  mergeFromIds?: string[]
  endingType?: 'GE' | 'NE' | 'BE' | 'TE' | 'HE'
  routeName?: string
  timeOfDay?: 'none' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight'
  weather?: 'none' | 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy'
  transition?: 'cut' | 'fade' | 'dissolve' | 'wipe'
  perspective?: 'first_person' | 'third_person' | 'overhead' | 'side_view'
}

interface Sprite {
  id: string
  characterId: string
  name: string
  type: 'base' | 'expression' | 'outfit' | 'pose'
  url: string
  tags: string[]
}

interface Character {
  id: string
  name: string
  color: string
  avatar?: string
  personality?: string
  description?: string
  sprites: Sprite[]
}

// Mock sprites
const mockSprites: Sprite[] = [
  { id: 's1', characterId: 'c1', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's2', characterId: 'c1', name: '微笑', type: 'expression', url: '', tags: ['微笑', '开心'] },
  { id: 's3', characterId: 'c1', name: '惊讶', type: 'expression', url: '', tags: ['惊讶', '意外'] },
  { id: 's4', characterId: 'c1', name: '害羞', type: 'expression', url: '', tags: ['害羞', '脸红'] },
  { id: 's5', characterId: 'c2', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's6', characterId: 'c2', name: '微笑', type: 'expression', url: '', tags: ['微笑'] },
  { id: 's7', characterId: 'c3', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's8', characterId: 'c3', name: '冷淡', type: 'expression', url: '', tags: ['冷淡', '无表情'] },
]

// Mock characters
const mockCharacters: Character[] = [
  { id: 'c1', name: '桜', color: '#ec4899', sprites: mockSprites.filter(s => s.characterId === 'c1') },
  { id: 'c2', name: '主人公', color: '#3b82f6', sprites: mockSprites.filter(s => s.characterId === 'c2') },
  { id: 'c3', name: '雪乃', color: '#8b5cf6', sprites: mockSprites.filter(s => s.characterId === 'c3') },
]

// Mock sub-sections for chapter editor
const generateMockSubSections = (chapter: Chapter): SubSection[] => {
  const subSections: SubSection[] = []
  const subSectionCount = Math.max(2, Math.min(chapter.keyPoints.length || 2, 3))
  for (let i = 0; i < subSectionCount; i++) {
    const kp = chapter.keyPoints[i]
    const dialogues: DialogueLine[] = [
      {
        id: `d-${chapter.id}-${i}-1`,
        type: 'narration',
        content: kp?.scene || '阳光透过窗户洒进教室，空气中弥漫着青春的气息。',
      },
      {
        id: `d-${chapter.id}-${i}-2`,
        type: 'dialogue',
        characterId: 'c1',
        characterName: '桜',
        content: kp?.description || '今天真是个特别的日子呢...',
      },
      {
        id: `d-${chapter.id}-${i}-3`,
        type: 'dialogue',
        characterId: 'c2',
        characterName: '主人公',
        content: '（她的笑容如同春日暖阳，让人不自觉地放松下来。）',
      },
    ]
    if (i === subSectionCount - 1 && chapter.route === 'common' && chapter.endingType !== 'HE') {
      dialogues.push({
        id: `d-${chapter.id}-${i}-4`,
        type: 'choice',
        content: '接下来要怎么做？',
        choices: [
          { text: '向前一步', targetSubSectionId: `sub-${chapter.id}-a` },
          { text: '原地等待', targetSubSectionId: `sub-${chapter.id}-b` },
        ],
      })
    }
    subSections.push({
      id: `sub-${chapter.id}-${i}`,
      title: `${i + 1}. ${kp?.title || '场景' + (i + 1)}`,
      background: kp?.background || '教室',
      bgm: i === 0 ? '春日の出会い' : '日常のひととき',
      dialogues,
    })
  }
  return subSections
}

// Route labels
const routeLabels: Record<string, { label: string; color: string }> = {
  common: { label: '共通线', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  a: { label: 'A线', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  b: { label: 'B线', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  c: { label: 'C线', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  true: { label: 'True', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

// Ending labels
const endingLabels: Record<string, { label: string; color: string }> = {
  HE: { label: 'Happy End', color: 'bg-pink-100 text-pink-700' },
  NE: { label: 'Normal End', color: 'bg-blue-100 text-blue-700' },
  BE: { label: 'Bad End', color: 'bg-red-100 text-red-700' },
  TE: { label: 'True End', color: 'bg-emerald-100 text-emerald-700' },
}

// Mock AI outline generator
const generateMockOutline = (projectName: string, narrativeStructure: string, count: number): Chapter[] => {
  const subSectionTemplates = [
    { title: '日常的开始', description: '主角的平凡日常被一件小事打破，故事从这里拉开序幕。', background: '教室', scene: '早晨的教室里，阳光透过窗户洒在课桌上。' },
    { title: '意外的相遇', description: '一次意料之外的邂逅，改变了主角的人生轨迹。', background: '樱花树下', scene: '樱花纷飞的季节，花瓣随风飘落，她在树下等待。' },
    { title: '午后的对话', description: '安静的午后，两人有了第一次深入的交流。', background: '天台', scene: '午后的阳光温暖而慵懒，天台上只有微风和远处操场的声音。' },
    { title: '心动的瞬间', description: '一个不经意的小动作，让主角第一次意识到自己的心意。', background: '放学路', scene: '夕阳将两人的影子拉得很长，并肩走在回家的路上。' },
    { title: '雨中的约定', description: '突如其来的大雨中，两人许下了重要的约定。', background: '公园', scene: '大雨滂沱，公园的凉亭成了临时的避风港。' },
    { title: '社团的挑战', description: '社团活动中出现了意想不到的困难和竞争。', background: '社团教室', scene: '社团教室里气氛紧张，所有人都在为即将到来的比赛做准备。' },
    { title: '夏日的祭典', description: '夏夜的花火大会上，感情迎来了新的转折点。', background: '神社', scene: '夜空被烟花点亮，穿着浴衣的人们在祭典中欢笑。' },
    { title: '秋日的告别', description: '秋天的落叶中，主角面临着重要的抉择。', background: '车站', scene: '月台上人来人往，广播声和脚步声交织在一起。' },
    { title: '冬日的温暖', description: '寒冷的冬日里，一份温暖融化了所有隔阂。', background: '咖啡厅', scene: '窗外飘着雪花，咖啡的香气弥漫在温暖的室内。' },
    { title: '最终的选择', description: '一切线索汇聚在一起，主角必须做出最终的决定。', background: '学校', scene: '熟悉的校园在夕阳下显得格外宁静，所有的回忆涌上心头。' },
  ]

  const chapters: Chapter[] = []
  const isBranching = narrativeStructure === '分支叙事' || narrativeStructure === '多结局'

  const makeChapter = (number: number, kpCount: number, startIdx: number, route: Chapter['route'] = 'common', endingType?: Chapter['endingType'], branchFrom?: string): Chapter => {
    const kps: KeyPoint[] = []
    for (let i = 0; i < kpCount; i++) {
      const tpl = subSectionTemplates[(startIdx + i) % subSectionTemplates.length]
      kps.push({ id: `kp-${number}-${i}-${Date.now()}`, title: tpl.title, description: tpl.description, background: tpl.background, scene: tpl.scene })
    }
    return { id: `ch-${Date.now()}-${number}`, number, title: `第${number}章`, scenes: kps.map(k => k.background), keyPoints: kps, route, endingType, branchFrom }
  }

  if (isBranching) {
    const commonCount = Math.max(1, Math.floor(count * 0.6))
    for (let i = 0; i < commonCount; i++) chapters.push(makeChapter(i + 1, 2 + (i % 3), i * 2, 'common'))
    const routeCount = Math.min(2, count - commonCount)
    const routes: Array<'a' | 'b'> = ['a', 'b']
    const perRoute = Math.max(1, Math.floor((count - commonCount) / routeCount))
    for (let r = 0; r < routeCount; r++) {
      for (let i = 0; i < perRoute; i++) {
        const num = commonCount + r * perRoute + i + 1
        const isLast = i === perRoute - 1
        chapters.push(makeChapter(num, 2 + (i % 2), (commonCount + r * 2 + i) * 2, routes[r], isLast ? (routes[r] === 'a' ? 'HE' : 'NE') : undefined, chapters[commonCount - 1]?.id))
      }
    }
  } else {
    for (let i = 0; i < count; i++) chapters.push(makeChapter(i + 1, 2 + (i % 3), i * 2, 'common', i === count - 1 ? 'HE' : undefined))
  }
  return chapters
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <EditorContent />
    </Suspense>
  )
}

function EditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id') || 'demo'
  const [activeTab, setActiveTab] = useState('outline')
  const [project, setProject] = useState<ProjectData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [viewMode, setViewMode] = useState<'auto' | 'timeline' | 'tree'>('auto')

  useEffect(() => {
    const saved = localStorage.getItem(`project-${projectId}`)
    if (saved) { setProject(JSON.parse(saved)) }
    else {
      setProject({
        id: projectId, name: '星光学院物语', emotionStyle: '泣系',
        themeBackground: '校园', narrativeStructure: '多结局',
        synopsis: '在星光学院，一段关于友情、爱情与成长的故事正在上演...',
        chapterCount: 6, chapters: [],
      })
    }
  }, [projectId])

  const saveProject = useCallback((updatedProject: ProjectData) => {
    setProject(updatedProject)
    localStorage.setItem(`project-${projectId}`, JSON.stringify(updatedProject))
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [projectId])

  const handleGenerateOutline = async () => {
    if (!project) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const chapters = generateMockOutline(project.name, project.narrativeStructure, project.chapterCount)
    saveProject({ ...project, chapters })
    setIsGenerating(false)
  }

  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!project) return
    saveProject({ ...project, chapters: project.chapters.map(ch => ch.id === chapterId ? { ...ch, ...updates } : ch) })
  }

  const deleteChapter = (chapterId: string) => {
    if (!project) return
    saveProject({ ...project, chapters: project.chapters.filter(ch => ch.id !== chapterId).map((ch, idx) => ({ ...ch, number: idx + 1 })) })
  }

  const moveChapter = (chapterId: string, direction: 'up' | 'down') => {
    if (!project) return
    const idx = project.chapters.findIndex(ch => ch.id === chapterId)
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === project.chapters.length - 1)) return
    const newChapters = [...project.chapters]
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    ;[newChapters[idx], newChapters[swapIdx]] = [newChapters[swapIdx], newChapters[idx]]
    saveProject({ ...project, chapters: newChapters.map((ch, i) => ({ ...ch, number: i + 1 })) })
  }

  const addChapter = () => {
    if (!project) return
    const num = project.chapters.length + 1
    saveProject({ ...project, chapters: [...project.chapters, {
      id: `ch-${Date.now()}`, number: num, title: `第${num}章`,
      scenes: ['教室'], keyPoints: [{
        id: `kp-${Date.now()}`, title: '新小节', description: '小节内容描述...', background: '教室', scene: '场景描述...',
      }], route: 'common',
    }]})
  }

  const addKeyPoint = (chapterId: string) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    updateChapter(chapterId, { keyPoints: [...chapter.keyPoints, {
      id: `kp-${Date.now()}`, title: '新小节', description: '小节内容描述...', background: chapter.scenes[0] || '教室', scene: '场景描述...',
    }]})
  }

  const updateKeyPoint = (chapterId: string, keyPointId: string, updates: Partial<KeyPoint>) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    updateChapter(chapterId, { keyPoints: chapter.keyPoints.map(kp => kp.id === keyPointId ? { ...kp, ...updates } : kp) })
  }

  const deleteKeyPoint = (chapterId: string, keyPointId: string) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    updateChapter(chapterId, { keyPoints: chapter.keyPoints.filter(kp => kp.id !== keyPointId) })
  }

  const addRoute = (route: string) => {
    if (!project) return
    const routeLabel = route.toLowerCase() as 'a' | 'b' | 'c' | 'true'
    const num = project.chapters.length + 1
    saveProject({ ...project, chapters: [...project.chapters, {
      id: crypto.randomUUID(), number: num, title: `第${num}章`,
      scenes: ['新场景'], keyPoints: [], route: routeLabel,
    }]})
  }

  const effectiveViewMode = viewMode === 'auto'
    ? (project?.narrativeStructure === '线性叙事' ? 'timeline' : 'tree') : viewMode

  // Reorder chapters (drag and drop)
  const reorderChapters = (fromIndex: number, toIndex: number) => {
    if (!project || fromIndex === toIndex) return
    const newChapters = [...project.chapters]
    const [moved] = newChapters.splice(fromIndex, 1)
    newChapters.splice(toIndex, 0, moved)
    saveProject({ ...project, chapters: newChapters.map((ch, i) => ({ ...ch, number: i + 1 })) })
  }

  if (!project) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-14 z-40 border-b border-pink-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /><span className="text-sm">返回</span>
            </button>
            <div className="h-5 w-px bg-border" />
            <input type="text" value={project.name} onChange={(e) => saveProject({ ...project, name: e.target.value })}
              className="bg-transparent text-lg font-semibold text-foreground outline-none focus:text-primary transition-colors" />
            {showSaved && (<span className="flex items-center gap-1 text-xs text-green-600"><Check className="h-3 w-3" />已保存</span>)}
          </div>
          <nav className="flex items-center gap-1 rounded-lg bg-muted/50 p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (<button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={cn('flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
                <Icon className="h-4 w-4" />{tab.label}</button>)
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/preview?id=${projectId}`)}
              className="flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-pink-300 hover:shadow-sm">
              <Play className="h-4 w-4" />预览</button>
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg hover:shadow-pink-300/50">
              <Download className="h-4 w-4" />导出</button>
          </div>
        </div>
      </header>
      <main className={cn(activeTab === 'chapter' ? 'h-[calc(100vh-73px)]' : 'mx-auto max-w-5xl px-6 py-8')}>
        {activeTab === 'outline' && (
          <OutlineTab project={project} isGenerating={isGenerating} viewMode={viewMode} effectiveViewMode={effectiveViewMode}
            onViewModeChange={setViewMode} onGenerate={handleGenerateOutline} onAddChapter={addChapter}
            onDeleteChapter={deleteChapter} onMoveChapter={moveChapter}
            onAddKeyPoint={addKeyPoint} onUpdateKeyPoint={updateKeyPoint} onDeleteKeyPoint={deleteKeyPoint}
            onAddRoute={addRoute} onReorderChapters={reorderChapters} />)}
        {activeTab === 'chapter' && <ChapterTab project={project} />}
        {activeTab === 'characters' && <CharacterTab project={project} />}
        {activeTab === 'asset' && <AssetTab project={project} />}
      </main>
    </div>
  )
}

// --- Outline Tab ---
interface OutlineTabProps {
  project: ProjectData; isGenerating: boolean; viewMode: 'auto' | 'timeline' | 'tree'
  effectiveViewMode: 'timeline' | 'tree'; onViewModeChange: (mode: 'auto' | 'timeline' | 'tree') => void
  onGenerate: () => void; onAddChapter: () => void; onDeleteChapter: (id: string) => void
  onMoveChapter: (id: string, direction: 'up' | 'down') => void
  onAddKeyPoint: (chapterId: string) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, updates: Partial<KeyPoint>) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
  onAddRoute?: (route: string) => void
  onReorderChapters: (fromIndex: number, toIndex: number) => void
}

function OutlineTab({ project, isGenerating, viewMode, effectiveViewMode, onViewModeChange, onGenerate, onAddChapter,
  onDeleteChapter, onMoveChapter, onAddKeyPoint, onUpdateKeyPoint, onDeleteKeyPoint, onAddRoute,
  onReorderChapters }: OutlineTabProps) {
  const isBranching = project.narrativeStructure === '分支叙事' || project.narrativeStructure === '多结局'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">故事大纲</h2>
          <span className="rounded-md bg-pink-50 px-2 py-1 text-xs font-medium text-pink-600">{project.narrativeStructure}</span>
        </div>
        <div className="flex items-center gap-3">
          {project.chapters.length > 0 && (
            <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1">
              {(['auto','timeline','tree'] as const).map(m => (
                <button key={m} onClick={() => onViewModeChange(m)}
                  className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    viewMode === m ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground')}>
                  {m === 'auto' ? '自动' : m === 'timeline' ? <><List className="h-3.5 w-3.5" />时间线</> : <><Network className="h-3.5 w-3.5" />树状图</>}
                </button>))}
            </div>)}
          <button onClick={onGenerate} disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg hover:shadow-pink-300/50 disabled:opacity-50">
            {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />AI 生成中...</> : <><Sparkles className="h-4 w-4" />{project.chapters.length > 0 ? 'AI 重新生成' : 'AI 生成大纲'}</>}</button>
        </div>
      </div>
      {isGenerating ? <GeneratingSkeleton count={project.chapterCount} /> :
       project.chapters.length === 0 ? <EmptyOutline onGenerate={onGenerate} /> :
       effectiveViewMode === 'timeline' ?
        <TimelineView chapters={project.chapters} onDeleteChapter={onDeleteChapter} onMoveChapter={onMoveChapter}
          onAddKeyPoint={onAddKeyPoint} onUpdateKeyPoint={onUpdateKeyPoint} onDeleteKeyPoint={onDeleteKeyPoint}
          onReorderChapters={onReorderChapters} /> :
        <TreeView chapters={project.chapters} isBranching={isBranching} onAddRoute={onAddRoute}
          onDeleteChapter={onDeleteChapter} onMoveChapter={onMoveChapter}
          onAddKeyPoint={onAddKeyPoint} onUpdateKeyPoint={onUpdateKeyPoint} onDeleteKeyPoint={onDeleteKeyPoint}
          onReorderChapters={onReorderChapters} />}
      {project.chapters.length > 0 && !isGenerating && (
        <button onClick={onAddChapter} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 py-4 text-sm font-medium text-pink-600 transition-all hover:border-pink-300 hover:bg-pink-50">
          <Plus className="h-4 w-4" />添加章节</button>)}
    </div>)
}

function EmptyOutline({ onGenerate }: { onGenerate: () => void }) {
  return (<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-pink-200 bg-pink-50/30 py-16">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-violet-100"><FileText className="h-8 w-8 text-pink-500" /></div>
    <h3 className="mb-2 text-lg font-semibold text-foreground">还没有大纲</h3>
    <p className="mb-6 text-sm text-muted-foreground">点击「AI 生成大纲」，根据你的设定自动生成章节结构</p>
    <button onClick={onGenerate} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-pink-200/50 transition-all hover:shadow-lg"><Sparkles className="h-4 w-4" />AI 生成大纲</button>
  </div>)
}

function GeneratingSkeleton({ count }: { count: number }) {
  return (<div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-xl border border-pink-100 bg-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100"><span className="text-sm font-semibold text-pink-600">{i + 1}</span></div>
          <div className="flex-1 space-y-3"><div className="h-5 w-1/3 rounded bg-pink-100" /><div className="h-4 w-full rounded bg-pink-50" /><div className="h-4 w-2/3 rounded bg-pink-50" /></div>
        </div></div>))}
  </div>)
}

interface ChapterViewProps {
  chapters: Chapter[]
  onDeleteChapter: (id: string) => void
  onMoveChapter: (id: string, direction: 'up' | 'down') => void
  onAddKeyPoint: (chapterId: string) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, updates: Partial<KeyPoint>) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
  onReorderChapters: (fromIndex: number, toIndex: number) => void
}

function TimelineView(props: ChapterViewProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  return (<div className="relative">
    <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-200 via-violet-200 to-pink-200" />
    <div className="space-y-6">{props.chapters.map((chapter, idx) => (
      <div key={chapter.id} className="relative"
        draggable
        onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(idx)); e.dataTransfer.effectAllowed = 'move' }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIndex(idx) }}
        onDragLeave={() => setDragOverIndex(null)}
        onDrop={(e) => {
          e.preventDefault(); setDragOverIndex(null)
          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
          if (!isNaN(fromIdx) && fromIdx !== idx) props.onReorderChapters(fromIdx, idx)
        }}
      >
        {dragOverIndex === idx && (<div className="absolute -top-3 left-0 right-0 h-0.5 bg-pink-400 rounded-full z-20" />)}
        <div className="absolute left-[20px] top-6 z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-violet-400 shadow-sm"><div className="h-1.5 w-1.5 rounded-full bg-white" /></div>
        <div className="ml-14"><ChapterCard chapter={chapter} index={idx} onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} /></div></div>))}
    </div></div>)
}

interface TreeViewProps extends ChapterViewProps { isBranching: boolean; onAddRoute?: (route: string) => void }

function DraggableChapterList({ chapters: filteredChapters, compact, allChapters, onDeleteChapter, onMoveChapter, onAddKeyPoint, onUpdateKeyPoint, onDeleteKeyPoint, onReorderChapters }: { chapters: Chapter[]; compact?: boolean; allChapters: Chapter[] } & ChapterViewProps) {
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const globalIdx = (idx: number) => allChapters.indexOf(filteredChapters[idx])
  return (<div className={compact ? 'space-y-3' : 'space-y-4'}>
    {filteredChapters.map((chapter, idx) => (
      <div key={chapter.id} className="relative"
        draggable
        onDragStart={(e) => { e.dataTransfer.setData('text/plain', String(globalIdx(idx))); e.dataTransfer.effectAllowed = 'move' }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverIdx(idx) }}
        onDragLeave={() => setDragOverIdx(null)}
        onDrop={(e) => {
          e.preventDefault(); setDragOverIdx(null)
          const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
          if (!isNaN(fromIdx) && fromIdx !== globalIdx(idx)) onReorderChapters(fromIdx, globalIdx(idx))
        }}
      >
        {dragOverIdx === idx && (<div className="absolute -top-1.5 left-0 right-0 h-0.5 bg-pink-400 rounded-full z-20" />)}
        <ChapterCard chapter={chapter} index={idx} compact={compact} onDeleteChapter={onDeleteChapter} onMoveChapter={onMoveChapter} onAddKeyPoint={onAddKeyPoint} onUpdateKeyPoint={onUpdateKeyPoint} onDeleteKeyPoint={onDeleteKeyPoint} />
      </div>))}
  </div>)
}

function TreeView({ chapters, isBranching, onAddRoute, ...props }: TreeViewProps) {
  const commonChapters = chapters.filter(ch => ch.route === 'common')
  const routeAChapters = chapters.filter(ch => ch.route === 'a')
  const routeBChapters = chapters.filter(ch => ch.route === 'b')
  const routeCChapters = chapters.filter(ch => ch.route === 'c')
  const trueChapters = chapters.filter(ch => ch.route === 'true')
  const hasBranches = routeAChapters.length > 0 || routeBChapters.length > 0

  return (<div className="space-y-6">
    {commonChapters.length > 0 && (<div>
      <div className="mb-3 flex items-center gap-2"><span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', routeLabels.common.color)}>{routeLabels.common.label}</span><div className="h-px flex-1 bg-pink-100" /></div>
      <DraggableChapterList chapters={commonChapters} allChapters={chapters} onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} onReorderChapters={props.onReorderChapters} /></div>)}
    {hasBranches && (<div className="flex items-center gap-3 py-2">
      <div className="flex-1 border-t border-dashed border-pink-300" /><div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-violet-100 px-4 py-1.5"><GitBranch className="h-4 w-4 text-pink-600" /><span className="text-xs font-medium text-pink-700">分支选择点</span></div><div className="flex-1 border-t border-dashed border-violet-300" /></div>)}
    <div className="grid gap-6 md:grid-cols-2">
      {routeAChapters.length > 0 && (<div className="rounded-xl border border-pink-200 bg-gradient-to-br from-pink-50/50 to-white p-4"><div className="mb-3 flex items-center gap-2"><span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', routeLabels.a.color)}>{routeLabels.a.label}</span></div><DraggableChapterList chapters={routeAChapters} allChapters={chapters} compact onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} onReorderChapters={props.onReorderChapters} /></div>)}
      {routeBChapters.length > 0 && (<div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/50 to-white p-4"><div className="mb-3 flex items-center gap-2"><span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', routeLabels.b.color)}>{routeLabels.b.label}</span></div><DraggableChapterList chapters={routeBChapters} allChapters={chapters} compact onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} onReorderChapters={props.onReorderChapters} /></div>)}
      {routeCChapters.length > 0 && (<div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white p-4"><div className="mb-3 flex items-center gap-2"><span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', routeLabels.c.color)}>{routeLabels.c.label}</span></div><DraggableChapterList chapters={routeCChapters} allChapters={chapters} compact onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} onReorderChapters={props.onReorderChapters} /></div>)}
      {trueChapters.length > 0 && (<div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-4"><div className="mb-3 flex items-center gap-2"><span className={cn('rounded-md border px-2 py-0.5 text-xs font-medium', routeLabels.true.color)}>{routeLabels.true.label}</span></div><DraggableChapterList chapters={trueChapters} allChapters={chapters} compact onDeleteChapter={props.onDeleteChapter} onMoveChapter={props.onMoveChapter} onAddKeyPoint={props.onAddKeyPoint} onUpdateKeyPoint={props.onUpdateKeyPoint} onDeleteKeyPoint={props.onDeleteKeyPoint} onReorderChapters={props.onReorderChapters} /></div>)}
      {hasBranches && (<div className="flex items-center justify-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-4">
        <button onClick={() => { const routeName = prompt('输入新路线名称（如：D线、Extra线）：'); if (routeName && onAddRoute) onAddRoute(routeName.toLowerCase().replace(/\s+/g, '-')) }} className="flex items-center gap-2 text-sm text-pink-500 hover:text-pink-600"><Plus className="h-4 w-4" />添加新路线</button></div>)}
    </div></div>)
}

interface ChapterCardProps {
  chapter: Chapter; index: number; compact?: boolean
  onDeleteChapter: (id: string) => void; onMoveChapter: (id: string, direction: 'up' | 'down') => void
  onAddKeyPoint: (chapterId: string) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, updates: Partial<KeyPoint>) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
}
function ChapterCard({ chapter, index, compact = false, onDeleteChapter, onMoveChapter, onAddKeyPoint, onUpdateKeyPoint, onDeleteKeyPoint }: ChapterCardProps) {
  const [expanded, setExpanded] = useState(false)
  const routeInfo = chapter.route ? routeLabels[chapter.route] : null
  const endingInfo = chapter.endingType ? endingLabels[chapter.endingType] : null
  return (<div className={cn('group rounded-xl border bg-white transition-all hover:shadow-md hover:shadow-pink-100/50', 'border-pink-100', compact ? 'p-3' : 'p-4')}>
    <div className="flex items-start gap-3">
      <div className={cn('flex items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-violet-100 font-semibold flex-shrink-0', compact ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm', 'text-pink-700')}>{chapter.number}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className={cn('font-semibold text-foreground', compact ? 'text-sm' : 'text-base')}>第{chapter.number}章</h3>
          {routeInfo && !compact && (<span className={cn('rounded-md border px-1.5 py-0.5 text-[10px] font-medium', routeInfo.color)}>{routeInfo.label}</span>)}
          {endingInfo && (<span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', endingInfo.color)}>{endingInfo.label}</span>)}
          <span className="text-xs text-muted-foreground ml-auto">{chapter.keyPoints.length} 个小节</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="mt-2 flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? '收起小节' : '展开小节'}
        </button>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onMoveChapter(chapter.id, 'up')} disabled={index === 0} className="rounded-md p-1.5 text-muted-foreground hover:bg-pink-50 hover:text-foreground disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
        <button onClick={() => onMoveChapter(chapter.id, 'down')} className="rounded-md p-1.5 text-muted-foreground hover:bg-pink-50 hover:text-foreground disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
        <button onClick={() => onDeleteChapter(chapter.id)} className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
      </div>
    </div>
    {expanded && (<div className="mt-4 ml-14 space-y-3">
      {chapter.keyPoints.map((kp, kpIdx) => (<div key={kp.id} className="rounded-lg border border-pink-100 bg-pink-50/30 p-3 space-y-2 group/kp">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-200 text-[10px] font-bold text-pink-600">{kpIdx + 1}</span>
          <input type="text" value={kp.title} onChange={(e) => onUpdateKeyPoint(chapter.id, kp.id, { title: e.target.value })} className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none hover:bg-white/50 focus:bg-white rounded px-1.5 py-0.5 transition-colors" placeholder="小节标题" />
          <button onClick={() => onDeleteKeyPoint(chapter.id, kp.id)} className="opacity-0 group-hover/kp:opacity-100 text-red-400 hover:text-red-600 transition-opacity"><X className="h-3.5 w-3.5" /></button>
        </div>
        <div className="flex items-center gap-2 text-xs"><MapPin className="h-3 w-3 text-muted-foreground" /><input type="text" value={kp.background} onChange={(e) => onUpdateKeyPoint(chapter.id, kp.id, { background: e.target.value })} className="flex-1 bg-transparent text-muted-foreground outline-none hover:bg-white/50 focus:bg-white rounded px-1.5 py-0.5 transition-colors" placeholder="背景场景" /></div>
        <textarea value={kp.description} onChange={(e) => onUpdateKeyPoint(chapter.id, kp.id, { description: e.target.value })} rows={2} className="w-full bg-transparent text-xs text-muted-foreground outline-none hover:bg-white/50 focus:bg-white rounded px-1.5 py-1 transition-colors resize-none" placeholder="小节内容描述..." />
        <div className="flex items-center gap-2 text-xs"><Flag className="h-3 w-3 text-muted-foreground" /><input type="text" value={kp.scene} onChange={(e) => onUpdateKeyPoint(chapter.id, kp.id, { scene: e.target.value })} className="flex-1 bg-transparent text-muted-foreground outline-none hover:bg-white/50 focus:bg-white rounded px-1.5 py-0.5 transition-colors" placeholder="场景描述..." /></div>
      </div>))}
      <button onClick={() => onAddKeyPoint(chapter.id)} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-pink-200 py-2.5 text-xs font-medium text-pink-500 hover:border-pink-300 hover:bg-pink-50/50"><Plus className="h-3.5 w-3.5" />添加小节</button>
    </div>)}
  </div>)
}

// ===== Chapter Tab =====
function ChapterTab({ project }: { project: ProjectData }) {
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(project.chapters.length > 0 ? project.chapters[0].id : null)
  const [subSections, setSubSections] = useState<SubSection[]>([])
  const [expandedSubSection, setExpandedSubSection] = useState<string | null>(null)
  useEffect(() => {
    const chapter = project.chapters.find(c => c.id === selectedChapterId)
    if (chapter) { const mock = generateMockSubSections(chapter); setSubSections(mock); setExpandedSubSection(mock.length > 0 ? mock[0].id : null) }
  }, [selectedChapterId, project.chapters])
  const selectedChapter = project.chapters.find(c => c.id === selectedChapterId)
  if (project.chapters.length === 0) return (<div className="flex h-full items-center justify-center"><div className="text-center"><BookOpen className="mx-auto h-12 w-12 text-muted-foreground/30" /><p className="mt-4 text-muted-foreground">请先生成大纲</p></div></div>)

  // Choice stats
  const allChoices = subSections.flatMap(ss => ss.dialogues.filter(d => d.type === 'choice' && d.choices).flatMap(d => d.choices || []))
  const totalChoices = allChoices.length
  const branchChoices = allChoices.filter(c => (c.functionType || 'branch') === 'branch').length
  const affectionChoices = allChoices.filter(c => c.functionType === 'affection').length
  const flavorChoices = allChoices.filter(c => c.functionType === 'flavor').length
  const trapChoices = allChoices.filter(c => c.functionType === 'trap').length
  const badEndChoices = allChoices.filter(c => c.isBadEnd).length

  return (<div className="flex h-full">
    <div className="w-56 shrink-0 border-r border-border bg-card">
      <div className="border-b border-border p-3"><h3 className="text-sm font-medium text-foreground">章节列表</h3></div>
      <div className="overflow-y-auto p-2" style={{ height: 'calc(100% - 49px)' }}>
        {project.chapters.map((chapter, index) => (<button key={chapter.id} onClick={() => setSelectedChapterId(chapter.id)}
          className={cn('mb-1 w-full rounded-lg p-3 text-left transition-all', selectedChapterId === chapter.id ? 'bg-pink-50 border border-pink-200' : 'hover:bg-muted/50')}>
          <div className="flex items-center gap-2">
            <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium', selectedChapterId === chapter.id ? 'bg-pink-500 text-white' : 'bg-muted text-muted-foreground')}>{index + 1}</span>
            <span className="truncate text-sm font-medium text-foreground">{chapter.title}</span>
          </div>
          {chapter.route && (<span className={cn('mt-1 ml-8 inline-block rounded px-1.5 py-0.5 text-[10px]', routeLabels[chapter.route]?.color || 'bg-muted text-muted-foreground')}>{routeLabels[chapter.route]?.label}</span>)}
        </button>))}
      </div>
    </div>

    <div className="flex-1 overflow-y-auto bg-background p-6">
      {selectedChapter ? (<div>
        <div className="mb-6"><h2 className="text-xl font-semibold text-foreground">{selectedChapter.title}</h2><p className="mt-1 text-sm text-muted-foreground">{selectedChapter.keyPoints.length} 个小节</p></div>
        {/* Choice Stats */}
        {totalChoices > 0 && (<div className="mb-6 rounded-xl border border-pink-100 bg-gradient-to-r from-pink-50/50 to-violet-50/50 p-4">
          <div className="flex items-center gap-2 mb-3"><GitBranch className="h-4 w-4 text-pink-500" /><span className="text-sm font-medium text-foreground">选择肢分析</span><span className="text-xs text-muted-foreground">共 {totalChoices} 个选择</span></div>
          <div className="grid grid-cols-5 gap-3">
            <div className="text-center"><div className="text-lg font-bold text-blue-600">{branchChoices}</div><div className="text-[10px] text-muted-foreground">分支选择</div></div>
            <div className="text-center"><div className="text-lg font-bold text-pink-600">{affectionChoices}</div><div className="text-[10px] text-muted-foreground">好感度</div></div>
            <div className="text-center"><div className="text-lg font-bold text-purple-600">{flavorChoices}</div><div className="text-[10px] text-muted-foreground">风味选项</div></div>
            <div className="text-center"><div className="text-lg font-bold text-orange-600">{trapChoices}</div><div className="text-[10px] text-muted-foreground">陷阱选项</div></div>
            <div className="text-center"><div className="text-lg font-bold text-red-600">{badEndChoices}</div><div className="text-[10px] text-muted-foreground">Bad End</div></div>
          </div>
        </div>)}
        <div className="space-y-4">
          {subSections.map((subSection, subIndex) => (<SubSectionCard key={subSection.id} subSection={subSection} index={subIndex}
            isExpanded={expandedSubSection === subSection.id} onToggle={() => setExpandedSubSection(expandedSubSection === subSection.id ? null : subSection.id)}
            onUpdate={(updated) => setSubSections(subSections.map(ss => ss.id === updated.id ? updated : ss))} />))}
        </div>
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-muted-foreground hover:border-pink-300 hover:text-pink-600 transition-colors"><Plus className="h-5 w-5" />添加小节</button>
        <div className="mt-4 flex justify-center"><button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"><Sparkles className="h-4 w-4" />AI 生成整章内容</button></div>
      </div>) : (<div className="flex h-full items-center justify-center"><p className="text-muted-foreground">请选择一个章节</p></div>)}
    </div>

    <div className="w-56 shrink-0 border-l border-border bg-card">
      <div className="border-b border-border p-3"><h3 className="text-sm font-medium text-foreground">角色</h3></div>
      <div className="p-3 space-y-2">
        {mockCharacters.map((char) => (<div key={char.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 cursor-pointer">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white font-medium" style={{ backgroundColor: char.color }}>{char.name[0]}</div>
          <div className="min-w-0"><p className="text-sm font-medium text-foreground truncate">{char.name}</p><p className="text-xs text-muted-foreground">未出场</p></div></div>))}
        <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border p-2 text-sm text-muted-foreground hover:border-pink-300 hover:text-pink-600"><Plus className="h-4 w-4" />添加角色</button>
      </div>
    </div>
  </div>)
}

// SubSectionCard (simplified - existing code preserved)
function SubSectionCard({ subSection, index, isExpanded, onToggle, onUpdate }: { subSection: SubSection; index: number; isExpanded: boolean; onToggle: () => void; onUpdate?: (subSection: SubSection) => void }) {
  const [showSceneControls, setShowSceneControls] = useState(false)
  return (<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={onToggle}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-violet-100 text-sm font-semibold text-pink-600">{index + 1}</div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{subSection.title}</h4>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><ImageIcon className="h-3 w-3" />{subSection.background}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><Music className="h-3 w-3" />{subSection.bgm}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><MessageSquare className="h-3 w-3" />{subSection.dialogues.length} 条对话</span>
          {subSection.endingType && (<span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', subSection.endingType === 'BE' ? 'bg-red-100 text-red-600' : subSection.endingType === 'HE' || subSection.endingType === 'GE' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600')}>{subSection.endingType}</span>)}
          {subSection.isMergePoint && (<span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600"><GitMerge className="h-3 w-3 inline mr-0.5" />汇合点</span>)}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); setShowSceneControls(!showSceneControls) }} className="rounded p-1.5 text-muted-foreground hover:text-pink-400 hover:bg-pink-50" title="场景设置"><Settings className="h-4 w-4" /></button>
      <ChevronRight className={cn('h-5 w-5 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
    </div>
    {showSceneControls && (<div className="border-b border-border bg-gradient-to-r from-pink-50/50 to-violet-50/50 p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><label className="text-xs text-muted-foreground">🕐 时间</label><select className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs" value={subSection.timeOfDay || 'none'} onChange={(e) => onUpdate?.({ ...subSection, timeOfDay: e.target.value as SubSection['timeOfDay'] })}>
          <option value="none">无</option><option value="dawn">黎明</option><option value="morning">早晨</option><option value="noon">正午</option><option value="afternoon">午后</option><option value="evening">傍晚</option><option value="night">夜晚</option><option value="midnight">深夜</option></select></div>
        <div><label className="text-xs text-muted-foreground">🌤️ 天气</label><select className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs" value={subSection.weather || 'none'} onChange={(e) => onUpdate?.({ ...subSection, weather: e.target.value as 'none' | 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' })}>
          <option value="none">无</option><option value="sunny">晴天</option><option value="cloudy">多云</option><option value="rainy">雨天</option><option value="snowy">雪天</option><option value="stormy">暴风雨</option></select></div>
        <div><label className="text-xs text-muted-foreground">✨ 转场</label><select className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs" value={subSection.transition || 'cut'} onChange={(e) => onUpdate?.({ ...subSection, transition: e.target.value as 'cut' | 'fade' | 'dissolve' | 'wipe' })}>
          <option value="cut">硬切</option><option value="fade">淡入淡出</option><option value="dissolve">溶解</option><option value="wipe">擦除</option></select></div>
        <div><label className="text-xs text-muted-foreground">👁️ 视角</label><select className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs" value={subSection.perspective || 'first_person'} onChange={(e) => onUpdate?.({ ...subSection, perspective: e.target.value as 'first_person' | 'third_person' | 'overhead' | 'side_view' })}>
          <option value="first_person">第一人称</option><option value="third_person">第三人称</option><option value="overhead">俯视角</option><option value="side_view">侧视角</option></select></div>
      </div>
    </div>)}
    {isExpanded && (<div className="border-t border-border bg-muted/20 p-4">
      <div className="flex items-center gap-4 mb-4 rounded-lg bg-card border border-border p-3">
        <div className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">背景:</span><span className="text-sm text-foreground">{subSection.background}</span></div>
        <div className="flex items-center gap-2"><Music className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">BGM:</span><span className="text-sm text-foreground">{subSection.bgm}</span></div>
      </div>
      <div className="space-y-3">
        {subSection.dialogues.map((dialogue, dIndex) => (<DialogueCard key={dialogue.id} dialogue={dialogue} index={dIndex} onUpdate={(updated) => {
          onUpdate?.({ ...subSection, dialogues: subSection.dialogues.map(d => d.id === updated.id ? updated : d) })
        }} />))}
      </div>
      <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors"><Quote className="h-4 w-4" />旁白</button>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors"><User className="h-4 w-4" />角色对话</button>
        <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors"><HelpCircle className="h-4 w-4" />选择支</button>
        <div className="flex-1" />
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"><Sparkles className="h-4 w-4" />AI 生成</button>
      </div>
    </div>)}
  </div>)
}

// DialogueCard (simplified)
function DialogueCard({ dialogue, index, onUpdate }: { dialogue: DialogueLine; index: number; onUpdate?: (dialogue: DialogueLine) => void }) {
  const [showSettings, setShowSettings] = useState(false)
  if (dialogue.type === 'narration') return (<div className="group rounded-lg border border-border bg-muted/30 p-3 hover:border-pink-200">
    <div className="flex items-center gap-2 mb-2"><span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">旁白</span><span className="text-xs text-muted-foreground">#{index + 1}</span></div>
    <p className="text-sm italic text-muted-foreground">{dialogue.content}</p></div>)
  if (dialogue.type === 'choice') return (<div className="group rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-3">
    <div className="flex items-center gap-2 mb-2"><HelpCircle className="h-4 w-4 text-amber-600" /><span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">选择支</span><span className="text-xs text-muted-foreground">#{index + 1}</span></div>
    <p className="text-sm font-medium text-foreground mb-3">{dialogue.content}</p>
    {dialogue.choices && (<div className="space-y-2">{dialogue.choices.map((choice, cIndex) => {
      const cType = choice.type || 'normal'; const fType = choice.functionType || 'branch'
      return (<div key={cIndex} className={`flex flex-col gap-1 rounded-md border px-3 py-2 ${cType === 'hidden' ? 'border-purple-200 bg-purple-50/50' : cType === 'timed' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-white/60'}`}>
        <div className="flex items-center gap-2">
          <ChevronRight className={`h-3 w-3 shrink-0 ${cType === 'hidden' ? 'text-purple-600' : cType === 'timed' ? 'text-red-600' : 'text-amber-600'}`} />
          <span className="text-sm text-foreground">{choice.text}</span>
          {cType === 'hidden' && <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">隐藏</span>}
          {cType === 'timed' && choice.timeout && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">{choice.timeout}秒</span>}
          {fType !== 'branch' && <span className={`rounded px-1.5 py-0.5 text-[10px] ${fType === 'affection' ? 'bg-pink-100 text-pink-600' : fType === 'flavor' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>{fType === 'affection' ? '好感度' : fType === 'flavor' ? '风味' : '陷阱'}</span>}
          {choice.isBadEnd && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600 font-medium">Bad End</span>}
        </div>
      </div>)
    })}</div>)}
  </div>)
  const char = mockCharacters.find(c => c.id === dialogue.characterId)
  return (<div className="group rounded-lg border border-border bg-card p-3 hover:border-pink-200">
    <div className="flex items-center gap-2 mb-2">
      {char && (<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium" style={{ backgroundColor: char.color }}>{char.name[0]}</div>)}
      <span className="text-sm font-medium" style={{ color: char?.color || '#666' }}>{dialogue.characterName || '未知角色'}</span>
      <span className="text-xs text-muted-foreground">#{index + 1}</span>
    </div>
    <p className="text-sm text-foreground">{dialogue.content}</p>
  </div>)
}

// ===== Character Tab (simplified) =====
function CharacterTab({ project }: { project: ProjectData }) {
  const [characters] = useState<Character[]>(mockCharacters); const [selectedCharId, setSelectedCharId] = useState<string | null>(characters[0]?.id || null)
  const selectedChar = characters.find(c => c.id === selectedCharId)
  return (<div className="h-full flex flex-col overflow-hidden">
    <div className="flex-shrink-0 border-b border-border bg-card/50 px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        {characters.map(char => (<button key={char.id} onClick={() => setSelectedCharId(char.id)}
          className={cn("flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap", selectedCharId === char.id ? "bg-pink-50 border border-pink-200 text-pink-700" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground")}>
          <div className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: char.color }}>{char.name[0]}</div>
          <span className="text-sm font-medium">{char.name}</span></button>))}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-pink-200 text-pink-500 hover:bg-pink-50/50 transition-all whitespace-nowrap"><Plus className="h-4 w-4" /><span className="text-sm">添加角色</span></button>
      </div>
    </div>
    <div className="flex-1 overflow-auto p-6">
      {selectedChar ? (<div className="max-w-5xl mx-auto">
        <div className="flex gap-6 mb-8 pb-6 border-b border-border">
          <div className="flex-shrink-0"><div className="w-40 h-56 rounded-xl bg-gradient-to-b from-pink-50 to-violet-50 border border-pink-100 flex items-center justify-center overflow-hidden">
            <div className="flex h-full w-full items-center justify-center text-white text-5xl font-bold" style={{ backgroundColor: selectedChar.color }}>{selectedChar.name[0]}</div></div></div>
          <div className="flex-1"><h2 className="text-2xl font-bold text-foreground">{selectedChar.name}</h2>
            <p className="text-muted-foreground mt-1">「{selectedChar.description || '暂无描述'}」</p></div>
        </div>
        {(['expression','outfit','pose'] as const).map(type => {
          const sprites = selectedChar.sprites.filter(s => s.type === type)
          if (sprites.length === 0) return null
          const colorStyles = {
            expression: { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100', icon: 'text-blue-200', gradient: 'from-blue-50' },
            outfit: { bg: 'bg-green-50', text: 'text-green-500', border: 'border-green-100', icon: 'text-green-200', gradient: 'from-green-50' },
            pose: { bg: 'bg-purple-50', text: 'text-purple-500', border: 'border-purple-100', icon: 'text-purple-200', gradient: 'from-purple-50' },
          } as const
          const cs = colorStyles[type]
          return (<div key={type} className="mb-8"><div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2"><span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', cs.bg, cs.text)}>{type === 'expression' ? '📋' : type === 'outfit' ? '👗' : '🎭'}</span>{type === 'expression' ? '表情差分' : type === 'outfit' ? '服装差分' : '动作差分'}</h3></div>
            <div className="flex gap-4 overflow-x-auto pb-2">{sprites.map(sprite => (<div key={sprite.id} className="group relative flex-shrink-0">
              <div className={cn('w-28 h-40 rounded-xl bg-gradient-to-b to-white border flex items-center justify-center overflow-hidden', cs.gradient, cs.border)}><ImageIcon className={cn('h-10 w-10', cs.icon)} /></div>
              <div className="mt-2 text-center"><span className="text-sm font-medium text-foreground">{sprite.name}</span></div></div>))}
              <div className="w-28 h-40 flex-shrink-0 border-dashed border-2 border-pink-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors"><div className="flex flex-col items-center gap-2 text-pink-400"><Plus className="w-8 h-8" /><span className="text-xs">添加</span></div></div></div></div>)
        })}
      </div>) : (<div className="flex flex-col items-center justify-center h-full text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 mb-4"><Users className="h-8 w-8 text-pink-400" /></div><h3 className="text-lg font-medium text-foreground mb-2">还没有角色</h3></div>)}
    </div>
  </div>)
}

// ===== Asset Tab (simplified) =====
type AssetCategory = 'background' | 'cg' | 'bgm' | 'se' | 'voice'
interface AssetItem { id: string; name: string; category: AssetCategory; url: string; tags: string[]; usageCount: number; usedIn: string[]; status: 'generated' | 'uploaded' | 'placeholder'; createdAt: string }
const mockAssets: AssetItem[] = [
  { id: 'bg-1', name: '教室-白天', category: 'background', url: '', tags: ['教室','学校','白天'], usageCount: 5, usedIn: ['第一章','第二章','第三章'], status: 'generated', createdAt: '2小时前' },
  { id: 'bg-2', name: '教室-傍晚', category: 'background', url: '', tags: ['教室','学校','傍晚'], usageCount: 2, usedIn: ['第二章'], status: 'generated', createdAt: '2小时前' },
  { id: 'bgm-1', name: '春日の出会い', category: 'bgm', url: '', tags: ['欢快','春天','日常'], usageCount: 6, usedIn: ['第一章','第二章','第三章'], status: 'generated', createdAt: '1小时前' },
  { id: 'cg-1', name: '初遇-樱花树下', category: 'cg', url: '', tags: ['樱花','相遇','事件'], usageCount: 1, usedIn: ['第一章'], status: 'generated', createdAt: '1小时前' },
  { id: 'se-1', name: '脚步声-室内', category: 'se', url: '', tags: ['脚步','室内'], usageCount: 8, usedIn: ['第一章','第二章','第三章'], status: 'generated', createdAt: '1小时前' },
  { id: 'voice-1', name: '樱井阳菜-greeting', category: 'voice', url: '', tags: ['阳菜','问候'], usageCount: 1, usedIn: ['第一章'], status: 'placeholder', createdAt: '30分钟前' },
]
const assetCategories: { id: AssetCategory; label: string; icon: typeof Image; color: string }[] = [
  { id: 'background', label: '背景', icon: ImageIcon, color: 'emerald' }, { id: 'cg', label: 'CG', icon: Eye, color: 'amber' },
  { id: 'bgm', label: 'BGM', icon: Music2, color: 'blue' }, { id: 'se', label: '音效', icon: Volume2, color: 'green' },
  { id: 'voice', label: '语音', icon: Mic, color: 'violet' },
]
const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-100' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-100' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-100' },
}

function AssetTab({ project }: { project: ProjectData }) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('background'); const [searchQuery, setSearchQuery] = useState('')
  const filteredAssets = mockAssets.filter(a => a.category === activeCategory && (!searchQuery || a.name.includes(searchQuery) || a.tags.some(t => t.includes(searchQuery))))
  const colors = colorMap[assetCategories.find(c => c.id === activeCategory)!.color]
  return (<div className="mx-auto max-w-[1600px] px-6 py-6">
    <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-semibold text-foreground">素材管理</h2><p className="mt-1 text-sm text-muted-foreground">管理游戏所需的所有素材资源</p></div>
      <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"><Sparkles className="h-4 w-4" />AI 批量生成</button></div>
    <div className="mb-6 flex items-center gap-2 border-b border-border pb-0">
      {assetCategories.map(cat => { const Icon = cat.icon; const isActive = activeCategory === cat.id; const c = colorMap[cat.color]
        return (<button key={cat.id} onClick={() => { setActiveCategory(cat.id); setSearchQuery('') }}
          className={cn('flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors', isActive ? `${c.bg} ${c.text} border-current` : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50')}>
          <Icon className="h-4 w-4" />{cat.label}<span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', isActive ? c.light : 'bg-muted text-muted-foreground')}>{mockAssets.filter(a => a.category === cat.id).length}</span></button>)})}
    </div>
    <div className="mb-5 flex items-center gap-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="搜索素材..." className="rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-pink-300 focus:outline-none w-56" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
      <div className="flex-1" />
      <button className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors', colors.border, colors.text)}><Sparkles className="h-4 w-4" />AI 生成{assetCategories.find(c => c.id === activeCategory)?.label}</button>
      <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"><Upload className="h-4 w-4" />上传</button>
    </div>
    {filteredAssets.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredAssets.map(asset => (
          <div key={asset.id} className="group rounded-xl border border-border bg-card overflow-hidden hover:border-pink-200 hover:shadow-md transition-all cursor-pointer">
            <div className="relative aspect-[4/3] bg-gradient-to-br from-pink-100 to-violet-100 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-pink-300/60" />
              {asset.usageCount > 0 && <div className="absolute top-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-foreground backdrop-blur-sm">使用 {asset.usageCount} 次</div>}
            </div>
            <div className="p-3">
              <h4 className="text-sm font-medium text-foreground truncate">{asset.name}</h4>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {asset.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={cn('rounded px-1.5 py-0.5 text-[10px]', colors.bg, colors.text)}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
        <button className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 p-4 min-h-[180px] hover:border-pink-300 hover:bg-pink-50/60 transition-colors">
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', colors.light)}>
            <Plus className={cn('h-5 w-5', colors.text)} />
          </div>
          <span className={cn('text-sm font-medium', colors.text)}>添加素材</span>
        </button>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className={cn('flex h-16 w-16 items-center justify-center rounded-full mb-4', colors.light)}>
          <FolderOpen className={cn('h-8 w-8', colors.text)} />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {searchQuery ? '没有找到匹配的素材' : '还没有素材'}
        </h3>
      </div>
    )}
  </div>)
}
