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
    tags: ["校园"],
    storyLength: "短篇",
    chapterCount: 8,
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
    tags: ["校园"],
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
    tags: ["异世界", "奇幻"],
    storyLength: "长篇",
    worldSetting:
      "一个普通的高中生突然被召唤到了名为'艾尔兰蒂亚'的奇幻世界。在这里，魔法与剑术并存，龙族与精灵共舞……",
    currentStep: 3,
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-12T20:00:00Z",
    isArchived: false,
    isPublic: false,
  },
  "demo-3": {
    id: "demo-3",
    name: "深夜迷案",
    description: "都市悬疑推理视觉小说",
    coverUrl: "",
    tags: ["悬疑"],
    storyLength: "中篇",
    worldSetting:
      "在繁华都市的霓虹灯下，隐藏着不为人知的黑暗角落。一桩连环案件将侦探、记者和神秘少女紧密联系在一起……",
    currentStep: 1,
    createdAt: "2026-06-08T14:00:00Z",
    updatedAt: "2026-06-14T09:00:00Z",
    isArchived: false,
    isPublic: false,
  },
  "demo-4": {
    id: "demo-4",
    name: "星辰之约",
    description: "跨越星河的科幻恋爱故事",
    coverUrl: "",
    tags: ["科幻", "恋爱"],
    storyLength: "长篇",
    worldSetting:
      "公元 2157 年，人类已迈入星际殖民时代。在巨型空间站「新伊甸」上，一位年轻的机械师邂逅了来自外星的谜之少女……",
    currentStep: 4,
    createdAt: "2026-05-15T12:00:00Z",
    updatedAt: "2026-06-13T18:00:00Z",
    isArchived: false,
    isPublic: false,
  },
  "demo-5": {
    id: "demo-5",
    name: "江南烟雨录",
    description: "架空古风王朝的权谋与情仇",
    coverUrl: "",
    tags: ["古风", "悬疑"],
    storyLength: "长篇",
    worldSetting:
      "江南烟雨，长安繁华。大楚王朝末年，一位归隐的谋士被卷入朝堂与江湖的漩涡。权谋、情仇、家国天下……",
    currentStep: 5,
    createdAt: "2026-04-20T10:00:00Z",
    updatedAt: "2026-06-10T16:00:00Z",
    isArchived: false,
    isPublic: true,
  },
  "demo-6": {
    id: "demo-6",
    name: "猫耳咖啡馆",
    description: "温馨日常的恋爱模拟",
    coverUrl: "",
    tags: ["日常", "恋爱"],
    storyLength: "短篇",
    worldSetting:
      "在街角的一家小小咖啡馆里，你遇见了带着猫耳头饰的可爱店员。每天的点单、闲聊和偶然的触碰，平凡的日子变得闪闪发光。",
    currentStep: 6,
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-06-15T12:00:00Z",
    isArchived: false,
    isPublic: true,
  },
  "demo-7": {
    id: "demo-7",
    name: "废弃校舍怪谈",
    description: "校园恐怖冒险游戏",
    coverUrl: "",
    tags: ["校园", "悬疑"],
    storyLength: "中篇",
    worldSetting:
      "深夜的校园，废弃的旧校舍里传来奇怪的声音。五个好奇心旺盛的学生决定一探究竟，却发现自己踏入了无法回头的恐怖领域……",
    currentStep: 2,
    createdAt: "2026-06-10T20:00:00Z",
    updatedAt: "2026-06-14T23:00:00Z",
    isArchived: true,
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
