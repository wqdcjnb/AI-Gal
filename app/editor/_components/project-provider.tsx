'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import type { ProjectData, Chapter, KeyPoint, Ending } from '@/app/editor/_lib/types'
import { mockProjects } from '@/lib/mock-projects'
import { generateMockOutline } from '@/app/editor/_lib/utils'

interface ProjectContextType {
  project: ProjectData | null
  projectId: string

  // Save
  saveProject: (updatedProject: ProjectData) => void
  showSaved: boolean

  // Chapter CRUD
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void
  addChapter: (route?: 'common' | 'a' | 'b' | 'c' | 'true') => void
  requestDeleteChapter: (chapterId: string) => void
  confirmDeleteChapter: () => void
  cancelDelete: () => void
  deleteConfirmId: string | null
  addRoute: (route: string, chapterCount?: number) => void

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

  // Undo state (shared across pages)
  showUndoToast: boolean
  deletedChapter: { chapter: Chapter; index: number } | null
  undoDelete: () => void
  dismissUndoToast: () => void
  showEndingUndoToast: boolean
  deletedEnding: { ending: Ending; index: number } | null
  undoDeleteEnding: () => void
  dismissEndingUndoToast: () => void

  // Editing chapter inline (for outline page)
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

export function ProjectProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id') || 'demo'

  const [project, setProject] = useState<ProjectData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingKeyPoint, setIsGeneratingKeyPoint] = useState(false)
  const [isGeneratingEnding, setIsGeneratingEnding] = useState(false)
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSummary, setEditSummary] = useState('')
  const [showSaved, setShowSaved] = useState(false)

  // Delete confirmation and undo states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deletedChapter, setDeletedChapter] = useState<{ chapter: Chapter; index: number } | null>(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Ending delete confirmation and undo states
  const [deleteEndingConfirmId, setDeleteEndingConfirmId] = useState<string | null>(null)
  const [deletedEnding, setDeletedEnding] = useState<{ ending: Ending; index: number } | null>(null)
  const [showEndingUndoToast, setShowEndingUndoToast] = useState(false)
  const endingUndoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load project from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`project-${projectId}`)
    if (saved) {
      setProject(JSON.parse(saved))
    } else {
      // Load from mock data
      const mock = mockProjects.find(p => p.id === projectId)
      const structure = mock?.structure || '分支叙事'
      const chCount = mock?.chapter_count || 6
      const chapters = generateMockOutline(mock?.name || '未命名', structure, chCount)
      const isMultiEnding = structure === '多结局'
      const defaultEndings: Ending[] = isMultiEnding ? [
        { id: 'end-1', type: 'GE', name: 'Good End', description: '最佳结局，所有谜团解开，与重要的人在一起' },
        { id: 'end-2', type: 'NE', name: 'Normal End', description: '普通结局，留下了些许遗憾' },
        { id: 'end-3', type: 'BE', name: 'Bad End', description: '悲剧结局，未能挽回的失去' },
        { id: 'end-4', type: 'TE', name: 'True End', description: '真正的结局，揭示世界的真相' },
      ] : []

      setProject({
        id: projectId,
        name: mock?.name || '未命名项目',
        emotionStyle: mock?.style || '恋爱喜剧',
        themeBackground: mock?.setting || '校园',
        narrativeStructure: structure,
        synopsis: mock?.synopsis || '',
        chapterCount: chCount,
        chapters,
        endings: defaultEndings,
      })
    }
  }, [projectId])

  // Save to localStorage
  const saveProject = useCallback((updatedProject: ProjectData) => {
    setProject(updatedProject)
    localStorage.setItem(`project-${projectId}`, JSON.stringify(updatedProject))
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2000)
  }, [projectId])

  // Generate outline
  const handleGenerateOutline = async (description?: string, requirements?: string) => {
    if (!project) return
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const chapters = generateMockOutline(project.name, project.narrativeStructure, project.chapterCount, description, requirements)
    saveProject({ ...project, chapters })
    setIsGenerating(false)
  }

  // AI Generate for Key Point
  const handleAIGenerateKeyPoint = async (keyPointId: string) => {
    setIsGeneratingKeyPoint(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockDescriptions = [
      '主角在樱花树下与女主角初次相遇，两人一见如故，展开了一段美好的校园生活。',
      '在夏日的祭典上，主角鼓起勇气向心仪的人表白，却意外发现对方也有同样的心意。',
      '秋天的校园里，主角和伙伴们一起为文化祭做准备，在忙碌中加深了彼此的羁绊。',
      '冬日的雪景中，主角回忆起与女主角的点点滴滴，决定不再逃避自己的感情。',
    ]
    const randomDesc = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)]

    if (project) {
      const updatedChapters = project.chapters.map(ch => ({
        ...ch,
        keyPoints: ch.keyPoints.map((kp: KeyPoint) =>
          kp.id === keyPointId ? { ...kp, description: randomDesc } : kp
        )
      }))
      saveProject({ ...project, chapters: updatedChapters })
    }
    setIsGeneratingKeyPoint(false)
  }

  // AI Generate for Ending
  const handleAIGenerateEnding = async (endingId: string) => {
    setIsGeneratingEnding(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    const mockDescriptions = [
      '主角与女主角在毕业典礼上正式确认了彼此的心意，携手走向美好的未来。',
      '虽然最终没能在一起，但那段美好的回忆将永远珍藏在心中。',
      '经历了重重考验，主角终于明白了什么是真正的幸福，与心爱的人共度余生。',
      '在命运的捉弄下，主角做出了艰难的选择，走向了意想不到的结局。',
    ]
    const randomDesc = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)]

    if (project && project.endings) {
      const updatedEndings = project.endings.map(e =>
        e.id === endingId ? { ...e, description: randomDesc } : e
      )
      saveProject({ ...project, endings: updatedEndings })
    }
    setIsGeneratingEnding(false)
  }

  // Update chapter
  const updateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    if (!project) return
    const updatedChapters = project.chapters.map(ch =>
      ch.id === chapterId ? { ...ch, ...updates } : ch
    )
    saveProject({ ...project, chapters: updatedChapters })
  }

  // Request delete chapter (show confirmation)
  const requestDeleteChapter = (chapterId: string) => {
    setDeleteConfirmId(chapterId)
  }

  // Confirm delete chapter
  const confirmDeleteChapter = () => {
    if (!project || !deleteConfirmId) return

    const chapterIndex = project.chapters.findIndex(ch => ch.id === deleteConfirmId)
    const chapterToDelete = project.chapters[chapterIndex]

    if (!chapterToDelete) return

    // Store deleted chapter for undo
    setDeletedChapter({ chapter: chapterToDelete, index: chapterIndex })

    const updatedChapters = project.chapters
      .filter(ch => ch.id !== deleteConfirmId)
      .map((ch, idx) => ({ ...ch, number: idx + 1 }))
    saveProject({ ...project, chapters: updatedChapters })

    // Clear confirmation
    setDeleteConfirmId(null)

    // Show undo toast
    setShowUndoToast(true)

    // Clear previous timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }

    // Auto-hide undo toast after 5 seconds
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoToast(false)
      setDeletedChapter(null)
    }, 5000)
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmId(null)
  }

  // Undo delete
  const undoDelete = () => {
    if (!project || !deletedChapter) return

    // Clear timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }

    // Restore chapter at original position
    const restoredChapter = { ...deletedChapter.chapter, number: deletedChapter.index + 1 }
    const updatedChapters = [...project.chapters]
    updatedChapters.splice(deletedChapter.index, 0, restoredChapter)

    // Renumber all chapters
    const renumberedChapters = updatedChapters.map((ch, idx) => ({ ...ch, number: idx + 1 }))
    saveProject({ ...project, chapters: renumberedChapters })

    // Clear undo state
    setShowUndoToast(false)
    setDeletedChapter(null)
  }

  // Dismiss undo toast
  const dismissUndoToast = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }
    setShowUndoToast(false)
    setDeletedChapter(null)
  }

  // Add chapter
  const addChapter = (route?: 'common' | 'a' | 'b' | 'c' | 'true') => {
    if (!project) return
    const chapterRoute = route || 'common'

    // 根据路线类型计算章节编号
    const routeChapters = project.chapters.filter(ch => ch.route === chapterRoute)
    const chapterNumber = routeChapters.length + 1

    // 计算显示编号（共通线从1开始，个人线接着共通线）
    const commonChapterCount = project.chapters.filter(ch => ch.route === 'common').length
    const displayNumber = chapterRoute === 'common'
      ? chapterNumber
      : commonChapterCount + chapterNumber

    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      number: chapterNumber,
      title: `第${toChineseNumberInternal(displayNumber)}章`,
      summary: '点击编辑章节摘要...',
      scenes: project.narrativeStructure === '多结局' ? [] : ['场景1'],
      keyPoints: [{ id: `kp-${Date.now()}`, text: '要点1' }],
      route: chapterRoute,
    }
    saveProject({ ...project, chapters: [...project.chapters, newChapter] })
  }

  // Add ending (for multi-ending mode)
  const addEnding = (endingData?: Ending) => {
    if (!project) return
    const endingTypes: Ending['type'][] = ['GE', 'NE', 'BE', 'TE']
    const existingTypes = project.endings?.map((e: Ending) => e.type) || []
    const nextType = endingData?.type || endingTypes.find(t => !existingTypes.includes(t)) || 'GE'
    const typeLabels: Record<Ending['type'], string> = {
      GE: 'Good End',
      NE: 'Normal End',
      BE: 'Bad End',
      TE: 'True End',
    }
    const newEnding: Ending = endingData || {
      id: `end-${Date.now()}`,
      type: nextType,
      name: typeLabels[nextType],
      description: '',
    }
    saveProject({ ...project, endings: [...(project.endings || []), newEnding] })
  }

  // Request delete ending (show confirmation)
  const requestDeleteEnding = (endingId: string) => {
    setDeleteEndingConfirmId(endingId)
  }

  // Confirm delete ending
  const confirmDeleteEnding = () => {
    if (!project || !deleteEndingConfirmId) return

    const endingIndex = (project.endings || []).findIndex(e => e.id === deleteEndingConfirmId)
    const endingToDelete = (project.endings || [])[endingIndex]

    if (!endingToDelete) return

    // Store deleted ending for undo
    setDeletedEnding({ ending: endingToDelete, index: endingIndex })

    const updatedEndings = (project.endings || []).filter(e => e.id !== deleteEndingConfirmId)
    saveProject({ ...project, endings: updatedEndings })

    // Clear confirmation
    setDeleteEndingConfirmId(null)

    // Show undo toast
    setShowEndingUndoToast(true)

    // Clear previous timeout
    if (endingUndoTimeoutRef.current) {
      clearTimeout(endingUndoTimeoutRef.current)
    }

    // Auto-hide undo toast after 5 seconds with fade out
    endingUndoTimeoutRef.current = setTimeout(() => {
      setShowEndingUndoToast(false)
      setTimeout(() => {
        setDeletedEnding(null)
      }, 500) // Wait for fade out animation
    }, 5000)
  }

  // Cancel delete ending
  const cancelDeleteEnding = () => {
    setDeleteEndingConfirmId(null)
  }

  // Undo delete ending
  const undoDeleteEnding = () => {
    if (!project || !deletedEnding) return

    // Clear timeout
    if (endingUndoTimeoutRef.current) {
      clearTimeout(endingUndoTimeoutRef.current)
    }

    // Restore ending at original position
    const updatedEndings = [...(project.endings || [])]
    updatedEndings.splice(deletedEnding.index, 0, deletedEnding.ending)
    saveProject({ ...project, endings: updatedEndings })

    // Clear states
    setShowEndingUndoToast(false)
    setDeletedEnding(null)
  }

  // Dismiss ending undo toast
  const dismissEndingUndoToast = () => {
    if (endingUndoTimeoutRef.current) {
      clearTimeout(endingUndoTimeoutRef.current)
    }
    setShowEndingUndoToast(false)
    setDeletedEnding(null)
  }

  // Update ending
  const updateEnding = (endingId: string, updates: Partial<Ending>) => {
    if (!project) return
    const updatedEndings = (project.endings || []).map((e: Ending) =>
      e.id === endingId ? { ...e, ...updates } : e
    )
    saveProject({ ...project, endings: updatedEndings })
  }

  // Add key point
  const addKeyPoint = (chapterId: string, keyPointData?: KeyPoint) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    const newKeyPoint: KeyPoint = keyPointData || {
      id: `kp-${Date.now()}`,
      text: '新要点',
    }
    updateChapter(chapterId, { keyPoints: [...chapter.keyPoints, newKeyPoint] })
  }

  // Update key point
  const updateKeyPoint = (chapterId: string, keyPointId: string, text: string) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    const updatedKeyPoints = chapter.keyPoints.map(kp =>
      kp.id === keyPointId ? { ...kp, text } : kp
    )
    updateChapter(chapterId, { keyPoints: updatedKeyPoints })
  }

  // Update key point data (full object including description)
  const updateKeyPointData = (keyPoint: KeyPoint) => {
    if (!project) return
    // Find which chapter contains this key point
    const chapter = project.chapters.find(ch => ch.keyPoints.some(kp => kp.id === keyPoint.id))
    if (!chapter) return
    const updatedKeyPoints = chapter.keyPoints.map(kp =>
      kp.id === keyPoint.id ? keyPoint : kp
    )
    updateChapter(chapter.id, { keyPoints: updatedKeyPoints })
  }

  // Delete key point
  const deleteKeyPoint = (chapterId: string, keyPointId: string) => {
    if (!project) return
    const chapter = project.chapters.find(ch => ch.id === chapterId)
    if (!chapter) return
    const updatedKeyPoints = chapter.keyPoints.filter(kp => kp.id !== keyPointId)
    updateChapter(chapterId, { keyPoints: updatedKeyPoints })
  }

  // Add route
  const addRoute = (route: string, chapterCount: number = 1) => {
    if (!project) return
    const routeLabel = route.toLowerCase() as 'a' | 'b' | 'c' | 'true'
    const commonChapterCount = project.chapters.filter(ch => ch.route === 'common').length
    const routeChapters = project.chapters.filter(ch => ch.route === routeLabel)

    const newChapters: Chapter[] = []
    for (let i = 0; i < chapterCount; i++) {
      const chapterNumber = commonChapterCount + routeChapters.length + i + 1
      newChapters.push({
        id: crypto.randomUUID(),
        number: chapterNumber,
        title: `${route}线 第${toChineseNumberInternal(chapterNumber)}章`,
        summary: '在此输入章节摘要...',
        scenes: ['新场景'],
        keyPoints: [],
        route: routeLabel,
      })
    }

    setProject({
      ...project,
      chapters: [...project.chapters, ...newChapters],
    })
  }

  // Start editing
  const startEditing = (chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setEditTitle(chapter.title)
    setEditSummary(chapter.summary)
  }

  // Save edit
  const saveEdit = () => {
    if (!editingChapterId || !project) return
    updateChapter(editingChapterId, { title: editTitle, summary: editSummary })
    setEditingChapterId(null)
  }

  // Cancel edit
  const cancelEdit = () => {
    setEditingChapterId(null)
  }

  return (
    <ProjectContext.Provider value={{
      project,
      projectId,
      saveProject,
      showSaved,
      updateChapter,
      addChapter,
      requestDeleteChapter,
      confirmDeleteChapter,
      cancelDelete,
      deleteConfirmId,
      addRoute,
      addKeyPoint,
      updateKeyPoint,
      updateKeyPointData,
      deleteKeyPoint,
      addEnding,
      updateEnding,
      requestDeleteEnding,
      confirmDeleteEnding,
      cancelDeleteEnding,
      deleteEndingConfirmId,
      isGenerating,
      handleGenerateOutline,
      isGeneratingKeyPoint,
      handleAIGenerateKeyPoint,
      isGeneratingEnding,
      handleAIGenerateEnding,
      showUndoToast,
      deletedChapter,
      undoDelete,
      dismissUndoToast,
      showEndingUndoToast,
      deletedEnding,
      undoDeleteEnding,
      dismissEndingUndoToast,
      editingChapterId,
      editTitle,
      editSummary,
      setEditTitle,
      setEditSummary,
      startEditing,
      saveEdit,
      cancelEdit,
    }}>
      {children}
    </ProjectContext.Provider>
  )
}

// Internal utility (local copy to avoid circular dependency)
const toChineseNumberInternal = (num: number): string => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) return chineseNums[num]
  if (num < 20) return `十${num === 10 ? '' : chineseNums[num - 10]}`
  if (num < 100) {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return `${chineseNums[tens]}十${ones ? chineseNums[ones] : ''}`
  }
  return num.toString()
}
