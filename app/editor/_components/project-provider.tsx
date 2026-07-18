'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ProjectData, Chapter, KeyPoint, Ending } from '@/app/editor/_lib/types'
import { mockProjects } from '@/lib/mock-projects'
import { generateMockOutline, generateChapterSkeleton } from '@/app/editor/_lib/utils'
import { useProjectStore } from '@/lib/project-store-zustand'

// ── Context API 不变，组件无需改动 ──

interface ProjectContextType {
  project: ProjectData | null
  projectId: string
  saveProject: (updatedProject: ProjectData) => void
  showSaved: boolean
  // Chapter CRUD
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void
  addChapter: (route?: string) => void
  requestDeleteChapter: (chapterId: string) => void
  confirmDeleteChapter: () => void
  cancelDelete: () => void
  deleteConfirmId: string | null
  addRoute: (route: string, chapterCount?: number, endingType?: string) => void
  // Key Point
  addKeyPoint: (chapterId: string, keyPointData?: KeyPoint) => void
  updateKeyPoint: (chapterId: string, keyPointId: string, text: string) => void
  updateKeyPointData: (keyPoint: KeyPoint) => void
  deleteKeyPoint: (chapterId: string, keyPointId: string) => void
  // Ending
  addEnding: (endingData?: Ending) => void
  updateEnding: (endingId: string, updates: Partial<Ending>) => void
  requestDeleteEnding: (endingId: string) => void
  confirmDeleteEnding: () => void
  cancelDeleteEnding: () => void
  deleteEndingConfirmId: string | null
  // AI Generate
  isGenerating: boolean
  handleGenerateOutline: (description?: string, requirements?: string) => Promise<void>
  isGeneratingKeyPoint: boolean
  handleAIGenerateKeyPoint: (keyPointId: string) => void
  isGeneratingEnding: boolean
  handleAIGenerateEnding: (endingId: string) => void
  // Undo
  showUndoToast: boolean
  deletedChapter: { chapter: Chapter; index: number } | null
  undoDelete: () => void
  dismissUndoToast: () => void
  showEndingUndoToast: boolean
  deletedEnding: { ending: Ending; index: number } | null
  undoDeleteEnding: () => void
  dismissEndingUndoToast: () => void
  // Inline editing
  editingChapterId: string | null
  editTitle: string
  editSummary: string
  setEditTitle: (title: string) => void
  setEditSummary: (summary: string) => void
  startEditing: (chapter: Chapter) => void
  saveEdit: () => void
  cancelEdit: () => void
}

const ProjectContext = createContext<ProjectContextType | null>(null)

export function useProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useProject must be used within ProjectProvider')
  return ctx
}

// ── Provider ──

export function ProjectProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id') || ''

  // ── Zustand store（内存 + localStorage） ──
  const storeProject = useProjectStore(s => s.project)
  const storeLoading = useProjectStore(s => s.loading)
  const storeShowSaved = useProjectStore(s => s.showSaved)
  const { loadProject, saveProject: storeSave, setShowSaved } = useProjectStore(s => s.actions)

  // ── Local UI state ──
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingKeyPoint, setIsGeneratingKeyPoint] = useState(false)
  const [isGeneratingEnding, setIsGeneratingEnding] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletedChapter, setDeletedChapter] = useState<{ chapter: Chapter; index: number } | null>(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [deleteEndingConfirmId, setDeleteEndingConfirmId] = useState<string | null>(null)
  const [deletedEnding, setDeletedEnding] = useState<{ ending: Ending; index: number } | null>(null)
  const [showEndingUndoToast, setShowEndingUndoToast] = useState(false)
  const endingUndoTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')

  // ── 加载项目：Zustand store 内部处理 localStorage → API 后台刷新 ──
  useEffect(() => {
    if (!projectId) return
    loadProject(projectId)

    // 兜底：如果 localStorage 和 API 都没有，从 mock 生成初始项目
    const checkAndInit = () => {
      const st = useProjectStore.getState()
      if (!st.loading && !st.project) {
        const mock = mockProjects.find(p => p.id === projectId)
        const structure = mock?.structure || '分支叙事'
        const chCount = mock?.chapter_count || 6
        const chapters = generateChapterSkeleton(structure, chCount)
        const fallback: ProjectData = {
          id: projectId,
          name: mock?.name || '未命名项目',
          emotionStyle: mock?.style || '恋爱喜剧',
          themeBackground: mock?.setting || '校园',
          narrativeStructure: structure,
          synopsis: mock?.synopsis || '',
          chapterCount: chCount,
          chapters,
          endings: [],
        }
        storeSave(fallback)
      }
    }

    if (!storeLoading && !storeProject) {
      checkAndInit()
    }
  }, [projectId])

  // Re-check when store state changes
  useEffect(() => {
    if (!storeLoading && !storeProject && projectId) {
      const mock = mockProjects.find(p => p.id === projectId)
      if (mock) {
        const structure = mock?.structure || '分支敘事'
        const chapters = generateChapterSkeleton(structure, mock.chapter_count || 6)
        storeSave({
          id: projectId, name: mock.name, emotionStyle: mock.style || '恋爱喜剧',
          themeBackground: mock.setting || '校园', narrativeStructure: structure,
          synopsis: mock.synopsis || '', chapterCount: mock.chapter_count || 6,
          chapters, endings: [],
        })
      }
    }
  }, [storeLoading, storeProject, projectId])

  // ── Save ──
  const saveProject = useCallback((updated: ProjectData) => {
    storeSave(updated)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [storeSave, setShowSaved])

  // ── Chapter CRUD ──
  const updateChapter = useCallback((chapterId: string, updates: Partial<Chapter>) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const chapters = st.project.chapters.map(ch => ch.id === chapterId ? { ...ch, ...updates } : ch)
    storeSave({ ...st.project, chapters })
  }, [storeSave])

  const addChapter = useCallback((route?: string) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const mainChapters = st.project.chapters.filter(c => !c.endingType)
    const endingChapters = st.project.chapters.filter(c => c.endingType)
    const chCount = mainChapters.length
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      number: chCount + 1,
      title: `第${chCount + 1}章`,
      summary: '',
      scenes: [],
      keyPoints: [],
      route: route || 'common',
    }
    // 主线章节插在结局章节前面
    storeSave({ ...st.project, chapters: [...mainChapters, newCh, ...endingChapters] })
  }, [storeSave])

  const requestDeleteChapter = useCallback((chapterId: string) => {
    setDeleteConfirmId(chapterId)
  }, [])

  const confirmDeleteChapter = useCallback(() => {
    if (!deleteConfirmId) return
    const st = useProjectStore.getState()
    if (!st.project) return
    const idx = st.project.chapters.findIndex(c => c.id === deleteConfirmId)
    if (idx === -1) return
    const chapter = st.project.chapters[idx]
    const updated = st.project.chapters.filter(c => c.id !== deleteConfirmId)
    storeSave({ ...st.project, chapters: updated })
    setDeletedChapter({ chapter, index: idx })
    setDeleteConfirmId(null)
    setShowUndoToast(true)
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current)
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoToast(false)
      setTimeout(() => setDeletedChapter(null), 500)
    }, 5000)
  }, [deleteConfirmId, storeSave])

  const cancelDelete = useCallback(() => setDeleteConfirmId(null), [])

  const undoDelete = useCallback(() => {
    if (!deletedChapter) return
    const st = useProjectStore.getState()
    if (!st.project) return
    const chapters = [...st.project.chapters]
    chapters.splice(deletedChapter.index, 0, deletedChapter.chapter)
    storeSave({ ...st.project, chapters })
    setDeletedChapter(null)
    setShowUndoToast(false)
  }, [deletedChapter, storeSave])

  const dismissUndoToast = useCallback(() => {
    setShowUndoToast(false)
    setTimeout(() => setDeletedChapter(null), 500)
  }, [])

  const addRoute = useCallback((route: string, chapterCount?: number, endingType?: string) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const count = chapterCount || 2
    const mainChapters = st.project.chapters.filter(c => !c.endingType)
    const endingChapters = st.project.chapters.filter(c => c.endingType)
    const mainCount = mainChapters.length
    const newChapters: Chapter[] = []
    for (let i = 0; i < count; i++) {
      newChapters.push({
        id: `ch-${Date.now()}-${i}`,
        number: mainCount + i + 1,
        title: `第${mainCount + i + 1}章`,
        summary: '',
        scenes: [],
        keyPoints: [],
        route,
      })
    }
    // 插入到主线之后、结局之前
    storeSave({ ...st.project, chapters: [...mainChapters, ...newChapters, ...endingChapters] })
  }, [storeSave])

  // ── Key Point CRUD ──
  const addKeyPoint = useCallback((chapterId: string, keyPointData?: KeyPoint) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const kp: KeyPoint = keyPointData || {
      id: `kp-${Date.now()}`,
      text: '新关键点',
      description: '',
    }
    const chapters = st.project.chapters.map(ch =>
      ch.id === chapterId ? { ...ch, keyPoints: [...ch.keyPoints, kp] } : ch
    )
    storeSave({ ...st.project, chapters })
  }, [storeSave])

  const updateKeyPoint = useCallback((chapterId: string, keyPointId: string, text: string) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const chapters = st.project.chapters.map(ch =>
      ch.id === chapterId ? {
        ...ch,
        keyPoints: ch.keyPoints.map(kp => kp.id === keyPointId ? { ...kp, text } : kp)
      } : ch
    )
    storeSave({ ...st.project, chapters })
  }, [storeSave])

  const updateKeyPointData = useCallback((keyPoint: KeyPoint) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const chapters = st.project.chapters.map(ch => ({
      ...ch,
      keyPoints: ch.keyPoints.map(kp => kp.id === keyPoint.id ? keyPoint : kp)
    }))
    storeSave({ ...st.project, chapters })
  }, [storeSave])

  const deleteKeyPoint = useCallback((chapterId: string, keyPointId: string) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const chapters = st.project.chapters.map(ch =>
      ch.id === chapterId ? { ...ch, keyPoints: ch.keyPoints.filter(kp => kp.id !== keyPointId) } : ch
    )
    storeSave({ ...st.project, chapters })
  }, [storeSave])

  // ── Ending CRUD ──
  const addEnding = useCallback((endingData?: Ending) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    const ending: Ending = endingData || {
      id: `end-${Date.now()}`,
      type: 'GE',
      name: '新结局',
      description: '',
    }
    storeSave({ ...st.project, endings: [...(st.project.endings || []), ending] })
  }, [storeSave])

  const updateEnding = useCallback((endingId: string, updates: Partial<Ending>) => {
    const st = useProjectStore.getState()
    if (!st.project || !st.project.endings) return
    storeSave({
      ...st.project,
      endings: st.project.endings.map(e => e.id === endingId ? { ...e, ...updates } : e)
    })
  }, [storeSave])

  const requestDeleteEnding = useCallback((endingId: string) => setDeleteEndingConfirmId(endingId), [])

  const confirmDeleteEnding = useCallback(() => {
    if (!deleteEndingConfirmId) return
    const st = useProjectStore.getState()
    if (!st.project?.endings) return
    const idx = st.project.endings.findIndex(e => e.id === deleteEndingConfirmId)
    if (idx === -1) return
    const ending = st.project.endings[idx]
    storeSave({ ...st.project, endings: st.project.endings.filter(e => e.id !== deleteEndingConfirmId) })
    setDeletedEnding({ ending, index: idx })
    setDeleteEndingConfirmId(null)
    setShowEndingUndoToast(true)
    if (endingUndoTimeoutRef.current) clearTimeout(endingUndoTimeoutRef.current)
    endingUndoTimeoutRef.current = setTimeout(() => {
      setShowEndingUndoToast(false)
      setTimeout(() => setDeletedEnding(null), 500)
    }, 5000)
  }, [deleteEndingConfirmId, storeSave])

  const cancelDeleteEnding = useCallback(() => setDeleteEndingConfirmId(null), [])

  const undoDeleteEnding = useCallback(() => {
    if (!deletedEnding) return
    const st = useProjectStore.getState()
    if (!st.project) return
    const endings = [...(st.project.endings || [])]
    endings.splice(deletedEnding.index, 0, deletedEnding.ending)
    storeSave({ ...st.project, endings })
    setDeletedEnding(null)
    setShowEndingUndoToast(false)
  }, [deletedEnding, storeSave])

  const dismissEndingUndoToast = useCallback(() => {
    setShowEndingUndoToast(false)
    setTimeout(() => setDeletedEnding(null), 500)
  }, [])

  // ── AI Generate ──
  const handleGenerateOutline = useCallback(async (description?: string, _requirements?: string) => {
    const st = useProjectStore.getState()
    if (!st.project) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const chapters = generateMockOutline(st.project.name, st.project.narrativeStructure, st.project.chapterCount, description)
    const sorted = [...chapters].sort((a, b) => a.number - b.number)
    storeSave({ ...st.project, chapters: sorted })
    setIsGenerating(false)
  }, [storeSave])

  const handleAIGenerateKeyPoint = useCallback((_keyPointId: string) => {
    setIsGeneratingKeyPoint(true)
    setTimeout(() => setIsGeneratingKeyPoint(false), 1500)
  }, [])

  const handleAIGenerateEnding = useCallback((_endingId: string) => {
    setIsGeneratingEnding(true)
    setTimeout(() => setIsGeneratingEnding(false), 1500)
  }, [])

  // ── Inline Editing ──
  const startEditing = useCallback((chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setEditTitle(chapter.title)
    setEditSummary(chapter.summary)
  }, [])

  const saveEdit = useCallback(() => {
    if (!editingChapterId) return
    updateChapter(editingChapterId, { title: editTitle, summary: editSummary })
    setEditingChapterId(null)
    setEditTitle('')
    setEditSummary('')
  }, [editingChapterId, editTitle, editSummary, updateChapter])

  const cancelEdit = useCallback(() => {
    setEditingChapterId(null)
    setEditTitle('')
    setEditSummary('')
  }, [])

  return (
    <ProjectContext.Provider value={{
      project: storeProject,
      projectId,
      saveProject,
      showSaved: storeShowSaved,
      // Chapter
      updateChapter, addChapter, requestDeleteChapter, confirmDeleteChapter, cancelDelete,
      deleteConfirmId, addRoute,
      // Key Point
      addKeyPoint, updateKeyPoint, updateKeyPointData, deleteKeyPoint,
      // Ending
      addEnding, updateEnding, requestDeleteEnding, confirmDeleteEnding, cancelDeleteEnding,
      deleteEndingConfirmId,
      // AI
      isGenerating, handleGenerateOutline, isGeneratingKeyPoint, handleAIGenerateKeyPoint,
      isGeneratingEnding, handleAIGenerateEnding,
      // Undo
      showUndoToast, deletedChapter, undoDelete, dismissUndoToast,
      showEndingUndoToast, deletedEnding, undoDeleteEnding, dismissEndingUndoToast,
      // Inline edit
      editingChapterId, editTitle, editSummary, setEditTitle, setEditSummary,
      startEditing, saveEdit, cancelEdit,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}
