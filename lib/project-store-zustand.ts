/**
 * 项目数据 Store — 三层架构
 *
 *   加载：IndexedDB(0ms) → Zustand → UI
 *         后台 GET /full → 比较 version → 更新 Zustand + IndexedDB
 *
 *   保存：组件 → Zustand(dirty) → IndexedDB(即时) → 30s → PATCH /full (version 校验)
 */
import { create } from 'zustand'
import type { ProjectData, Character, SavedCombo } from '@/app/editor/_lib/types'
import { generateChapterSkeleton } from '@/app/editor/_lib/utils'
import { putProject, getProject as idbGetProject } from './indexeddb-cache'

// ============================================================
// Store
// ============================================================

type SyncStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error'

interface ProjectStore {
  projectId: string | null
  project: ProjectData | null
  characters: Character[]
  savedCombos: Record<string, SavedCombo[]>
  version: number
  syncStatus: SyncStatus
  loading: boolean
  showSaved: boolean

  loadProject: (id: string) => Promise<void>
  saveProject: (updated: ProjectData) => void
  saveCharacters: (chars: Character[]) => void
  saveCombos: (combos: Record<string, SavedCombo[]>) => void
  forceSave: () => Promise<void>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projectId: null,
  project: null,
  characters: [],
  savedCombos: {},
  version: 1,
  syncStatus: 'idle',
  loading: false,
  showSaved: false,

  // ── 加载 ──
  async loadProject(id: string) {
    if (get().projectId === id && get().project) return
    set({ projectId: id, loading: true })

    // 1. IndexedDB → 即时渲染
    try {
      const cached = await idbGetProject(id)
      if (cached.project) {
        set({
          project: ensureChapters(cached.project),
          characters: cached.characters || [],
          savedCombos: cached.combos || {},
          version: cached.project.version ?? 1,
          loading: false,
        })
      }
    } catch {}

    // 2. API → 后台刷新
    try {
      const res = await fetch(`/api/projects/${id}/full`)
      const json = await res.json()
      if (json.success && json.data?.project) {
        const api = json.data
        const current = get().project

        // API version > 本地 → 用 API 数据；否则保留本地
        const apiVer = api.project.version ?? 1
        const localVer = current?.version ?? 0

        const project: ProjectData = {
          id: api.project.id,
          name: api.project.name,
          emotionStyle: api.project.emotion_style,
          themeBackground: api.project.theme_background,
          narrativeStructure: api.project.narrative_structure,
          synopsis: api.project.synopsis || '',
          chapterCount: api.project.chapter_count,
          chapters: (apiVer > localVer || !current?.chapters?.length)
            ? (api.chapters || [])
            : current.chapters,
          endings: (apiVer > localVer || !current?.endings?.length)
            ? (api.endings || [])
            : (current.endings || []),
          version: Math.max(apiVer, localVer),
        }
        if (api.characters?.length) set({ characters: api.characters.map((c: any) => ({ ...c, sprites: c.sprites || [] })) })
        // 只在 API 有数据时才覆盖，避免空数据清掉本地
        if (api.sprite_combos && Object.keys(api.sprite_combos).length > 0) {
          set({ savedCombos: api.sprite_combos })
        }

        set({ project: ensureChapters(project), loading: false, version: project.version })
        putProject(id, { project, characters: get().characters, savedCombos: get().savedCombos || api.sprite_combos || {} })
      } else if (!get().project) {
        set({ loading: false })
      }
    } catch {
      if (!get().project) set({ loading: false })
    }

    // 3. 最终兜底
    if (!get().project) {
      const pid = get().projectId
      if (pid) {
        set({
          project: {
            id: pid, name: '未命名', emotionStyle: '恋爱喜剧', themeBackground: '校园',
            narrativeStructure: '分支叙事', synopsis: '', chapterCount: 6,
            chapters: generateChapterSkeleton('分支叙事', 6), endings: [], version: 1,
          },
          loading: false,
        })
      }
    }
  },

  // ── 保存（即时写 IndexedDB, 30s 后写 API）──
  saveProject(updated: ProjectData) {
    const id = get().projectId
    if (!id) return

    const project = renumberChapters(updated)
    set({ project, syncStatus: 'dirty', showSaved: true })
    setTimeout(() => set({ showSaved: false }), 2000)

    // 立即镜像到 IndexedDB
    const { characters, savedCombos, version } = get()
    putProject(id, { project: { ...project, version }, characters, savedCombos })

    // 30s 后同步 server
    scheduleServerSync(id)
  },

  saveCharacters(chars: Character[]) {
    const id = get().projectId
    if (!id) return
    set({ characters: chars, syncStatus: 'dirty' })
    const { project, savedCombos, version } = get()
    if (project) putProject(id, { project: { ...project, version }, characters: chars, savedCombos })
    // 立即同步角色到服务器
    fetch(`/api/projects/${id}/full`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characters: chars }),
    }).catch(() => {})
  },

  saveCombos(combos: Record<string, SavedCombo[]>) {
    const id = get().projectId
    if (!id) return
    set({ savedCombos: combos, syncStatus: 'dirty' })
    const { project, characters, version } = get()
    if (project) putProject(id, { project: { ...project, version }, characters, savedCombos: combos })
    // 立即同步到服务器
    fetch(`/api/projects/${id}/full`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprite_combos: combos }),
    }).catch(() => {})
  },

  // ── Ctrl+S / beforeunload ──
  async forceSave() {
    const { projectId, project, characters, savedCombos, version, syncStatus } = get()
    if (syncStatus === 'saving' || !projectId || !project) return
    set({ syncStatus: 'saving' })

    try {
      const res = await fetch(`/api/projects/${projectId}/full`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version,
          meta: {
            name: project.name, emotion_style: project.emotionStyle,
            theme_background: project.themeBackground, narrative_structure: project.narrativeStructure,
            synopsis: project.synopsis, chapter_count: project.chapterCount,
          },
          chapters: project.chapters,
          endings: project.endings || [],
          characters,
          sprite_combos: savedCombos,
        }),
      })
      const json = await res.json()
      if (json.success && json.data?.version) {
        set({ syncStatus: 'saved', version: json.data.version, showSaved: true })
        setTimeout(() => set({ showSaved: false }), 2000)
      } else {
        set({ syncStatus: 'error' })
      }
    } catch {
      set({ syncStatus: 'error' })
    }
  },
}))

// ============================================================
// 30s debounce server sync
// ============================================================

const serverTimers = new Map<string, ReturnType<typeof setTimeout>>()

function scheduleServerSync(id: string) {
  const existing = serverTimers.get(id)
  if (existing) clearTimeout(existing)
  serverTimers.set(id, setTimeout(() => {
    serverTimers.delete(id)
    useProjectStore.getState().forceSave()
  }, 30000))
}

// ============================================================
// 章节排序 + 骨架
// ============================================================

function renumberChapters(project: ProjectData): ProjectData {
  const main = project.chapters.filter(c => !c.endingType).sort((a, b) => a.number - b.number)
  const endings = project.chapters.filter(c => c.endingType)
  return {
    ...project,
    chapters: [
      ...main.map((ch, i) => ({ ...ch, number: i + 1 })),
      ...endings.map((ch, i) => ({ ...ch, number: main.length + i + 1 })),
    ],
  }
}

function ensureChapters(project: ProjectData): ProjectData {
  if (project.chapters.length > 0) return renumberChapters(project)
  return { ...project, chapters: generateChapterSkeleton(project.narrativeStructure, project.chapterCount) }
}

// ============================================================
// Ctrl+S + beforeunload
// ============================================================

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      useProjectStore.getState().forceSave()
    }
  })

  window.addEventListener('beforeunload', () => {
    const st = useProjectStore.getState()
    if (!st.projectId || !st.project || st.syncStatus !== 'dirty') return

    // sendBeacon 发最后一把
    const payload = JSON.stringify({
      version: st.version,
      meta: { name: st.project.name, emotion_style: st.project.emotionStyle, theme_background: st.project.themeBackground, narrative_structure: st.project.narrativeStructure, synopsis: st.project.synopsis, chapter_count: st.project.chapterCount },
      chapters: st.project.chapters,
      endings: st.project.endings || [],
      characters: st.characters,
      sprite_combos: st.savedCombos,
    })
    try { navigator.sendBeacon(`/api/projects/${st.projectId}/full`, new Blob([payload], { type: 'application/json' })) } catch {}
  })
}
