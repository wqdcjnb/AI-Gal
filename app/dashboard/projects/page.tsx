"use client"

import { useState } from "react"
import { useProject } from "@/components/project/project-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Plus,
  Search,
  MoreHorizontal,
  Copy,
  Pencil,
  Archive,
  Trash2,
  FolderOpen,
  ArrowUpRight,
  Filter,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import type { GameCategory } from "@/types/project"

export default function ProjectsPage() {
  const { projects, createProject, updateProject, deleteProject } = useProject()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<GameCategory | "全部">("全部")
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string; name: string }>({
    open: false,
    id: "",
    name: "",
  })

  const activeProjects = projects.filter((p) => !p.isArchived)
  const archivedProjects = projects.filter((p) => p.isArchived)

  const filtered = activeProjects.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "全部" || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  const categories: (GameCategory | "全部")[] = [
    "全部",
    "校园",
    "奇幻",
    "悬疑",
    "异世界",
    "日常",
    "科幻",
    "恋爱",
    "古风",
  ]

  const handleCreate = () => {
    const project = createProject()
    window.location.href = `/dashboard/projects/${project.id}`
  }

  const handleRename = () => {
    if (renameDialog.name.trim()) {
      updateProject(renameDialog.id, { name: renameDialog.name.trim() })
      setRenameDialog({ open: false, id: "", name: "" })
    }
  }

  const handleDelete = () => {
    deleteProject(deleteDialog.id)
    setDeleteDialog({ open: false, id: "", name: "" })
  }

  const handleArchive = (id: string) => {
    const proj = projects.find((p) => p.id === id)
    if (proj) {
      updateProject(id, { isArchived: !proj.isArchived })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">我的项目</h1>
          <p className="text-muted-foreground mt-1">管理你创建的所有 Galgame 项目</p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
        >
          <Plus className="h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v: string) => setCategoryFilter(v as GameCategory | "全部")}
        >
          <SelectTrigger className="w-[120px]">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-1">
            {search || categoryFilter !== "全部" ? "没有匹配的项目" : "还没有项目"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search || categoryFilter !== "全部"
              ? "试试调整搜索或筛选条件"
              : "创建你的第一个 Galgame 项目开始创作"}
          </p>
          {!search && categoryFilter === "全部" && (
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
            >
              <Plus className="h-4 w-4" />
              新建项目
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:shadow-sm hover:border-purple-500/30 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Cover placeholder */}
                <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all">
                  <FolderOpen className="h-6 w-6 text-purple-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {project.description || "暂无简介"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {project.category}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {project.storyLength}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      步骤 {project.currentStep}/6
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                </span>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e: React.MouseEvent) => e.preventDefault()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e: React.MouseEvent) => e.preventDefault()}>
                    <DropdownMenuItem
                      onClick={() =>
                        setRenameDialog({ open: true, id: project.id, name: project.name })
                      }
                    >
                      <Pencil className="h-3.5 w-3.5 mr-2" />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const newProj = createProject()
                        updateProject(newProj.id, {
                          name: `${project.name} (副本)`,
                          description: project.description,
                          category: project.category,
                          storyLength: project.storyLength,
                          worldSetting: project.worldSetting,
                        })
                        window.location.href = `/dashboard/projects/${newProj.id}`
                      }}
                    >
                      <Copy className="h-3.5 w-3.5 mr-2" />
                      复制项目
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchive(project.id)}>
                      <Archive className="h-3.5 w-3.5 mr-2" />
                      {project.isArchived ? "取消归档" : "归档"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() =>
                        setDeleteDialog({ open: true, id: project.id, name: project.name })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 已归档项目 */}
      {archivedProjects.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            已归档 ({archivedProjects.length})
          </h3>
          <div className="space-y-1">
            {archivedProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 opacity-60 hover:opacity-100 transition-opacity"
              >
                <p className="text-sm">{project.name}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchive(project.id)}
                >
                  取消归档
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open: boolean) => !open && setRenameDialog({ open: false, id: "", name: "" })}
      >
        <DialogContent >
          <DialogHeader>
            <DialogTitle>重命名项目</DialogTitle>
            <DialogDescription>为项目输入一个新的名称。</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>项目名称</Label>
              <Input
                value={renameDialog.name}
                onChange={(e) =>
                  setRenameDialog((prev) => ({ ...prev, name: e.target.value }))
                }
                onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && handleRename()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, id: "", name: "" })}
            >
              取消
            </Button>
            <Button onClick={handleRename}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open: boolean) => !open && setDeleteDialog({ open: false, id: "", name: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>删除项目</DialogTitle>
            <DialogDescription>
              确定要删除「{deleteDialog.name}」吗？此操作不可撤销，所有项目数据将被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: "", name: "" })}
            >
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
