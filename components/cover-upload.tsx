"use client"

import { useState, useRef, useCallback, type DragEvent } from "react"
import { Upload, X, Loader2, Image as ImageIcon, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CoverUploadProps {
  value: string // 当前图片 URL 或 object URL
  onChange: (url: string, file?: File) => void // 选择文件后回调
  className?: string
  recommendedSize?: string // 如 "400x600"
  aspectRatio?: string // 如 "3/4"
}

export function CoverUpload({
  value,
  onChange,
  className,
  recommendedSize = "400x600",
  aspectRatio = "3/4",
}: CoverUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 点击触发文件选择
  const handleClick = () => {
    inputRef.current?.click()
  }

  // 处理文件
  const processFile = useCallback(
    async (file: File) => {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        setError("请选择图片文件（PNG、JPG、WebP 等）")
        return
      }

      // 验证文件大小（最大 10MB）
      if (file.size > 10 * 1024 * 1024) {
        setError("图片大小不能超过 10MB")
        return
      }

      setError(null)
      setIsUploading(true)

      // 模拟上传延迟（实际项目中替换为真正的上传 API）
      await new Promise((resolve) => setTimeout(resolve, 600))

      // 生成 object URL 用于预览
      const objectUrl = URL.createObjectURL(file)
      onChange(objectUrl, file)
      setIsUploading(false)
    },
    [onChange]
  )

  // 文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    // 重置 input 以允许重复选择同一文件
    e.target.value = ""
  }

  // 拖拽事件
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  // 移除图片
  const handleRemove = () => {
    // 释放 object URL
    if (value && value.startsWith("blob:")) {
      URL.revokeObjectURL(value)
    }
    onChange("")
    setError(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
        aria-label="上传封面图片"
      />

      {value ? (
        /* 有图片 - 显示预览 */
        <div
          className="relative group rounded-xl overflow-hidden border border-border bg-muted/30"
          style={{ aspectRatio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="封面预览"
            className="w-full h-full object-cover"
          />
          {/* 悬浮操作层 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
            <button
              onClick={handleClick}
              disabled={isUploading}
              className="p-2 rounded-full bg-white/90 text-foreground hover:bg-white transition-colors"
              title="替换封面"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="p-2 rounded-full bg-white/90 text-red-500 hover:bg-white transition-colors"
              title="移除封面"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* 尺寸提示 */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white/70 text-[10px] backdrop-blur-sm">
            {recommendedSize}
          </div>
        </div>
      ) : (
        /* 无图片 - 显示上传区域 */
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
            isDragging
              ? "border-purple-500 bg-purple-500/5 scale-[1.02]"
              : "border-border hover:bg-muted/50 hover:border-muted-foreground/30",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          {isUploading ? (
            /* 上传中 */
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
              <p className="text-sm text-muted-foreground">上传中...</p>
            </div>
          ) : (
            /* 默认状态 */
            <>
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors",
                  isDragging
                    ? "bg-purple-500/20 text-purple-500"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isDragging ? (
                  <ImageIcon className="h-6 w-6" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>
              <p className="text-sm">
                {isDragging ? (
                  <span className="text-purple-500 font-medium">
                    松开鼠标上传图片
                  </span>
                ) : (
                  <>
                    <span className="text-purple-500 font-medium">
                      点击上传
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      或拖拽图片到此处
                    </span>
                  </>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG / JPG / WebP，最大 10MB，推荐 {recommendedSize}
              </p>
            </>
          )}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}
