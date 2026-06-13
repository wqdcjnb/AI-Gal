"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { ProjectLayout } from "@/components/project/project-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  FileArchive,
  FileText,
  FolderOpen,
  Image,
  Music,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ExternalLink,
  Clock,
} from "lucide-react"
import Link from "next/link"

interface ExportStep {
  label: string
  icon: typeof FileText
  status: "pending" | "processing" | "done"
}

const steps: ExportStep[] = [
  { label: "整理角色立绘素材", icon: Image, status: "done" },
  { label: "整理背景 CG 素材", icon: Image, status: "done" },
  { label: "整理 BGM/音效素材", icon: Music, status: "done" },
  { label: "生成 script.rpy 脚本", icon: FileText, status: "processing" },
  { label: "生成 options.rpy 配置", icon: FileText, status: "pending" },
  { label: "生成 README 说明文档", icon: FileText, status: "pending" },
  { label: "打包为 ZIP 压缩包", icon: FileArchive, status: "pending" },
]

const exportHistory = [
  {
    id: "exp-1",
    date: "2026-06-12 15:30",
    fileSize: "24.5 MB",
    status: "ready" as const,
  },
  {
    id: "exp-2",
    date: "2026-06-10 10:15",
    fileSize: "22.1 MB",
    status: "ready" as const,
  },
]

export default function ExportPage() {
  const params = useParams()
  const projectId = params.id as string
  const [exportProgress, setExportProgress] = useState(57)
  const [isExporting, setIsExporting] = useState(true)
  const [exportDone, setExportDone] = useState(false)

  const handleExport = () => {
    setIsExporting(true)
    setExportDone(false)
    setExportProgress(0)
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          setExportDone(true)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 600)
  }

  return (
    <ProjectLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-4 w-4 text-purple-500" />
              Ren&apos;Py 工程导出
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        step.status === "done"
                          ? "bg-green-500/10"
                          : step.status === "processing"
                            ? "bg-purple-500/10"
                            : "bg-muted"
                      }`}
                    >
                      {step.status === "done" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : step.status === "processing" ? (
                        <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        step.status === "done"
                          ? "text-foreground"
                          : step.status === "processing"
                            ? "text-purple-600 font-medium"
                            : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.status === "done" && (
                      <Badge className="text-[10px] bg-green-500/10 text-green-600 border-none ml-auto">
                        完成
                      </Badge>
                    )}
                    {step.status === "processing" && (
                      <Badge className="text-[10px] bg-purple-500/10 text-purple-600 border-none ml-auto">
                        处理中
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">导出进度</span>
                <span className="font-medium">{Math.round(exportProgress)}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    导出中...
                  </>
                ) : exportDone ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    重新导出
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    开始导出
                  </>
                )}
              </Button>
              {exportDone && (
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                  下载 ZIP
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Structure Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-purple-500" />
              压缩包文件结构
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderOpen className="h-3.5 w-3.5" />
                游戏项目文件夹/
              </div>
              <div className="ml-4 space-y-0.5">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-3 w-3 text-amber-500" />
                  game/
                </div>
                <div className="ml-6 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-blue-500" />
                    script.rpy
                    <span className="text-muted-foreground">← 自动生成全剧情代码</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-3 w-3 text-pink-500" />
                    image/
                    <span className="text-muted-foreground">← 角色立绘 + 背景CG</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FolderOpen className="h-3 w-3 text-green-500" />
                    audio/
                    <span className="text-muted-foreground">← BGM + 音效资源</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-purple-500" />
                  options.rpy
                  <span className="text-muted-foreground">← 基础配置文件</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  README.txt
                  <span className="text-muted-foreground">← 导入 Ren&apos;Py 操作说明</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              导出记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exportHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <FileArchive className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        导出包 {record.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.date} · {record.fileSize}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ren'Py Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-purple-500" />
              Ren&apos;Py 使用说明
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="space-y-2">
              <p>
                <strong className="text-foreground">1. 下载并安装 Ren&apos;Py</strong>
                <br />
                前往 <a href="https://renpy.org" className="text-purple-500 hover:underline" target="_blank">renpy.org</a> 下载最新稳定版 Ren&apos;Py 引擎。
              </p>
              <p>
                <strong className="text-foreground">2. 解压 ZIP 压缩包</strong>
                <br />
                将下载的 ZIP 文件解压到 Ren&apos;Py 的 projects 目录下。
              </p>
              <p>
                <strong className="text-foreground">3. 启动 Ren&apos;Py 并运行</strong>
                <br />
                打开 Ren&apos;Py Launcher，在项目列表中找到你的游戏，点击「Launch Project」即可运行。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${projectId}/preview`}>
              <ChevronLeft className="h-4 w-4" /> 上一步
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">
              返回项目列表
            </Link>
          </Button>
        </div>
      </div>
    </ProjectLayout>
  )
}
