"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type { Project } from "@/types/project"

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  createProject: () => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  loading: boolean
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  currentProject: null,
  setCurrentProject: () => {},
  getProject: () => undefined,
  updateProject: async () => {},
  createProject: async () => ({ id: "", name: "", description: "", coverUrl: "", tags: [], storyLength: "短篇", chapterCount: 8, worldSetting: "", currentStep: 1, createdAt: "", updatedAt: "", isArchived: false, isPublic: false }),
  deleteProject: async () => {},
  loading: true,
})

export function useProject() {
  return useContext(ProjectContext)
}

function toProject(doc: Record<string, unknown> & { _id?: string; id?: string; name?: string; description?: string; coverUrl?: string }): Project {
  return {
    id: doc._id || doc.id,
    name: doc.name || "",
    description: doc.description || "",
    coverUrl: doc.coverUrl || "",
    tags: doc.tags || [],
    storyLength: doc.storyLength || "短篇",
    chapterCount: doc.chapterCount || 8,
    worldSetting: doc.worldSetting || "",
    currentStep: doc.currentStep || 1,
    createdAt: doc.createdAt || "",
    updatedAt: doc.updatedAt || "",
    isArchived: doc.isArchived || false,
    isPublic: doc.isPublic || false,
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载游戏列表
  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/db/projects")
      const data = await res.json()
      if (data.success) {
        setProjects(data.projects.map(toProject))
      }
    } catch (err) { console.error("加载项目失败:", err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadProjects() }, [loadProjects])

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  )

  const updateProject = useCallback(
    async (id: string, updates: Partial<Project>) => {
      const timestamp = new Date().toISOString()
      setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...updates, updatedAt: timestamp } : p))
      setCurrentProject((prev) => prev?.id === id ? { ...prev, ...updates, updatedAt: timestamp } : prev)
      await fetch(`/api/db/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }).catch(() => {})
    },
    []
  )

  const createProject = useCallback(async () => {
    const id = `proj-${Date.now()}`
    const newProject: Project = {
      id, name: "未命名游戏", description: "", coverUrl: "",
      tags: ["校园"], storyLength: "短篇", chapterCount: 8, worldSetting: "",
      currentStep: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      isArchived: false, isPublic: false,
    }
    setProjects((prev) => [...prev, newProject])
    await fetch("/api/db/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    }).catch(() => {})
    return newProject
  }, [])

  const deleteProject = useCallback(async (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    fetch(`/api/db/projects/${id}`, { method: "DELETE" }).catch(() => {})
  }, [])

  return (
    <ProjectContext.Provider
      value={{ projects, currentProject, setCurrentProject, getProject, updateProject, createProject, deleteProject, loading }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
