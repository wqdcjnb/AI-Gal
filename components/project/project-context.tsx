"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { Project } from "@/types/project"

// Mock 项目数据
function createMockProject(id: string): Project {
  return {
    id,
    name: "未命名项目",
    description: "",
    coverUrl: "",
    category: "校园",
    storyLength: "短篇",
    worldSetting: "",
    currentStep: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isArchived: false,
    isPublic: false,
  }
}

// Mock 项目存储
const mockProjects: Record<string, Project> = {
  "demo-1": {
    id: "demo-1",
    name: "夏日幻梦",
    description: "一个发生在夏日校园的青春恋爱故事",
    coverUrl: "",
    category: "校园",
    storyLength: "中篇",
    worldSetting:
      "故事发生在一所临海小镇的高中，夏天的海风带着咸咸的味道，吹拂着每一个少年的心。这里有着一个关于成长、友情与初恋的温馨故事……",
    currentStep: 2,
    createdAt: "2026-05-20T10:00:00Z",
    updatedAt: "2026-06-10T15:30:00Z",
    isArchived: false,
    isPublic: false,
  },
  "demo-2": {
    id: "demo-2",
    name: "异世界冒险录",
    description: "被召唤到异世界的冒险故事",
    coverUrl: "",
    category: "异世界",
    storyLength: "长篇",
    worldSetting:
      "一个普通的高中生突然被召唤到了名为'艾尔兰蒂亚'的奇幻世界。在这里，魔法与剑术并存，龙族与精灵共舞……",
    currentStep: 1,
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-12T20:00:00Z",
    isArchived: false,
    isPublic: false,
  },
}

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  getProject: (id: string) => Project | undefined
  updateProject: (id: string, updates: Partial<Project>) => void
  createProject: () => Project
  deleteProject: (id: string) => void
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  currentProject: null,
  setCurrentProject: () => {},
  getProject: () => undefined,
  updateProject: () => {},
  createProject: () => createMockProject(""),
  deleteProject: () => {},
})

export function useProject() {
  return useContext(ProjectContext)
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Record<string, Project>>(mockProjects)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const getProject = useCallback(
    (id: string) => projects[id],
    [projects]
  )

  const updateProject = useCallback(
    (id: string, updates: Partial<Project>) => {
      setProjects((prev) => ({
        ...prev,
        [id]: { ...prev[id], ...updates, updatedAt: new Date().toISOString() },
      }))
      // 同步更新 currentProject
      setCurrentProject((prev) =>
        prev?.id === id ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : prev
      )
    },
    []
  )

  const createProject = useCallback(() => {
    const id = `proj-${Date.now()}`
    const newProject = createMockProject(id)
    setProjects((prev) => ({ ...prev, [id]: newProject }))
    return newProject
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        projects: Object.values(projects),
        currentProject,
        setCurrentProject,
        getProject,
        updateProject,
        createProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}
