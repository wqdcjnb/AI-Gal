/**
 * 项目数据 Zustand Store — 三层缓存架构
 *
 * 第一层 内存（Zustand）   → 即时读写，组件间共享
 * 第二层 浏览器（localStorage） → 刷新不丢，启动时恢复
 * 第三层 数据库（CloudBase PG） → source of truth，后台同步
 *
 * 用法：
 *   const project = useProjectStore(s => s.project)
 *   const { loadProject, saveProject } = useProjectStore(s => s.actions)
 */
import { create } from 'zustand'
import type { ProjectData, Chapter, Character, Sprite, SavedCombo } from '@/app/editor/_lib/types'
import { generateChapterSkeleton } from '@/app/editor/_lib/utils'

// ============================================================
// Store 类型
// ============================================================

interface ProjectStore {
  // ── 项目数据 ──
  projectId: string | null
  project: ProjectData | null
  characters: Character[]
  savedCombos: Record<string, SavedCombo[]>

  // ── UI 状态 ──
  loading: boolean
  showSaved: boolean

  // ── Actions ──
  actions: {
    /** 加载项目（localStorage → 内存，后台从 API 刷新） */
    loadProject: (id: string) => void
    /** 保存项目（内存 → localStorage，后台 debounce → API） */
    saveProject: (project: ProjectData) => void
    saveCharacters: (chars: Character[]) => void
    saveCombos: (combos: Record<string, SavedCombo[]>) => void
    setShowSaved: (v: boolean) => void
  }
}

// ============================================================
// localStorage 缓存 key
// ============================================================

function lsKey(id: string) { return `project-${id}` }
function charKey(id: string) { return `ai-gal-characters-${id}` }
function comboKey(id: string) { return `ai-gal-combos-${id}` }

// ============================================================
// 从 localStorage 恢复
// ============================================================

function loadFromCache(id: string): {
  project: ProjectData | null
  characters: Character[]
  combos: Record<string, SavedCombo[]>
} {
  try {
    const proj = JSON.parse(localStorage.getItem(lsKey(id)) || 'null')
    const chars = JSON.parse(localStorage.getItem(charKey(id)) || 'null')
    const combos = JSON.parse(localStorage.getItem(comboKey(id)) || 'null')
    return { project: proj, characters: chars || [], combos: combos || {} }
  } catch {
    return { project: null, characters: [], combos: {} }
  }
}

/** 如果项目章节为空，自动生成骨架结构 */
function ensureChapters(project: ProjectData): ProjectData {
  if (project.chapters.length > 0) {
    const main = project.chapters.filter(c => !c.endingType).sort((a, b) => a.number - b.number)
    const endings = project.chapters.filter(c => c.endingType)
    return { ...project, chapters: [...main, ...endings] }
  }
  const chapters = generateChapterSkeleton(project.narrativeStructure, project.chapterCount)
  return { ...project, chapters }
}

// ============================================================
// Store
// ============================================================

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectId: null,
  project: null,
  characters: [],
  savedCombos: {},
  loading: false,
  showSaved: false,

  actions: {
    loadProject(id: string) {
      // 如果已加载同一项目，跳过
      if (get().projectId === id && get().project) return

      set({ projectId: id, loading: true })

      // 1. 第一层：从 localStorage 恢复（即时渲染）
      const cached = loadFromCache(id)
      if (cached.project) {
        const proj = ensureChapters(cached.project)
        set({ project: proj, characters: cached.characters, savedCombos: cached.combos, loading: false })
      }

      // 2. 第二层：后台从 API 同步元数据（覆盖 localStorage 的旧值）
      fetch(`/api/projects/${id}/full`)
        .then(r => r.json())
        .then(json => {
          if (json.success && json.data?.project) {
            const api = json.data
            const current = get().project
            // 合并：API 元数据 + 本地章节/结局内容（API 暂时没有章节数据）
            const merged: ProjectData = ensureChapters({
              id: api.project.id,
              name: api.project.name,
              emotionStyle: api.project.emotion_style,
              themeBackground: api.project.theme_background,
              narrativeStructure: api.project.narrative_structure,
              synopsis: api.project.synopsis || '',
              chapterCount: api.project.chapter_count,
              // 优先用本地已有的章节数据
              chapters: current?.chapters?.length ? current.chapters : (api.chapters || []),
              endings: current?.endings?.length ? current.endings : (api.endings || []),
            })
            set({ project: merged, loading: false })
            // 同步到 localStorage
            localStorage.setItem(lsKey(id), JSON.stringify(merged))
          } else if (!cached.project) {
            set({ loading: false })
          }
        })
        .catch(() => {
          if (!cached.project) set({ loading: false })
        })
    },

    saveProject(updated: ProjectData) {
      const id = get().projectId
      if (!id) return

      // 排序 + 自动编号：主线 1..N，结局按添加顺序，编号 N+1, N+2...
      const main = updated.chapters.filter(c => !c.endingType).sort((a, b) => a.number - b.number)
      const endings = updated.chapters.filter(c => c.endingType)
      const renumberedMain = main.map((ch, i) => ({ ...ch, number: i + 1 }))
      const renumberedEndings = endings.map((ch, i) => ({ ...ch, number: main.length + i + 1 }))
      const sorted = { ...updated, chapters: [...renumberedMain, ...renumberedEndings] }

      // 内存
      set({ project: sorted, showSaved: true })
      // localStorage
      localStorage.setItem(lsKey(id), JSON.stringify(sorted))
      // 后台同步 PG（debounce）
      scheduleAPISync(id, sorted)
    },

    saveCharacters(chars: Character[]) {
      const id = get().projectId
      if (!id) return
      set({ characters: chars })
      localStorage.setItem(charKey(id), JSON.stringify(chars))
    },

    saveCombos(combos: Record<string, SavedCombo[]>) {
      const id = get().projectId
      if (!id) return
      set({ savedCombos: combos })
      localStorage.setItem(comboKey(id), JSON.stringify(combos))
    },

    setShowSaved(v: boolean) {
      set({ showSaved: v })
    },
  },
}))

// ============================================================
// API 同步 debounce（避免频繁写 DB）
// ============================================================

const syncTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleAPISync(projectId: string, project: ProjectData) {
  const existing = syncTimers.get(projectId)
  if (existing) clearTimeout(existing)

  const timer = setTimeout(async () => {
    syncTimers.delete(projectId)
    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: project.id,
          name: project.name,
          emotion_style: project.emotionStyle,
          theme_background: project.themeBackground,
          narrative_structure: project.narrativeStructure,
          synopsis: project.synopsis,
          chapter_count: project.chapterCount,
        }),
      })
    } catch { /* 静默失败 */ }
  }, 2000) // 2 秒防抖

  syncTimers.set(projectId, timer)
}
