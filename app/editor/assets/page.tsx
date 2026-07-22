'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Search, Layers, List, FolderOpen, Sparkles, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { assetCategories, colorMap, placeholderGradients } from '@/app/editor/_lib/constants'
import type { AssetCategory, AssetItem } from '@/app/editor/_lib/types'
import { AssetCard } from '@/app/editor/_components/asset/asset-card'
import { AssetListItem } from '@/app/editor/_components/asset/asset-list-item'
import { AudioPlayerBar } from '@/app/editor/_components/asset/audio-player-bar'

const UPLOAD_CONFIGS: Record<string, { accept: string; namePrefix: string; maxSize: number }> = {
  background: { accept: 'image/png,image/jpeg,image/webp', namePrefix: '背景图片', maxSize: 5 },
  cg:        { accept: 'image/png,image/jpeg,image/webp', namePrefix: 'CG图片', maxSize: 5 },
  bgm:       { accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp3,audio/flac', namePrefix: 'BGM音乐', maxSize: 10 },
  se:        { accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp3,audio/flac', namePrefix: '音效', maxSize: 10 },
}

function apiToAsset(row: any): AssetItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    url: row.url,
    size: row.size || 0,
    usageCount: 0,
    usedIn: [],
    createdAt: new Date(row.created_at).toISOString(),
  }
}

export default function AssetsPage() {
  const { project } = useProject()
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('background')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [playingAsset, setPlayingAsset] = useState<AssetItem | null>(null)
  const [errorDialog, setErrorDialog] = useState('')
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'time'>('time')
  const [sortAsc, setSortAsc] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)

  // 从数据库加载素材
  useEffect(() => {
    if (!project) return
    setLoading(true)
    fetch(`/api/assets?projectId=${project.id}`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data) {
          setAssets(json.data.map(apiToAsset))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [project?.id])

  if (!project) return null

  const filteredAssets = assets.filter(asset => {
    if (asset.category !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return asset.name.toLowerCase().includes(q)
    }
    return true
  })

  const categoryAssets = assets.filter(a => a.category === activeCategory)
  const currentCategory = assetCategories.find(c => c.id === activeCategory)!
  const colors = colorMap[currentCategory.color]
  const uploadCfg = UPLOAD_CONFIGS[activeCategory]
  const isAudio = activeCategory === 'bgm' || activeCategory === 'se'

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project) return
    const maxBytes = uploadCfg.maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      setErrorDialog(`文件过大，${uploadCfg.namePrefix}不能超过 ${uploadCfg.maxSize}MB，当前文件 ${(file.size / 1024 / 1024).toFixed(1)}MB`)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setUploading(true)
    setUploadProgress(0)

    try {
      // 1. 上传文件到云存储（XHR 跟踪进度）
      const fd = new FormData()
      fd.append('file', file)
      const uploadJson = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `/api/upload/${activeCategory}`)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          try { resolve(JSON.parse(xhr.responseText)) } catch { reject(new Error('parse error')) }
        }
        xhr.onerror = () => reject(new Error('network error'))
        xhr.send(fd)
      })
      if (!uploadJson.success) return

      // 2. 自动生成名称
      const prefix = uploadCfg.namePrefix
      const existingSameCat = categoryAssets
      let n = 1
      while (existingSameCat.some(a => a.name === `${prefix}${n}`)) n++
      const autoName = `${prefix}${n}`

      // 3. 创建数据库记录
      const createRes = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: autoName,
          category: activeCategory,
          url: uploadJson.data.cdnUrl,
          size: uploadJson.data.size || file.size,
        }),
      })
      const createJson = await createRes.json()
      if (createJson.success) {
        setAssets(prev => [apiToAsset(createJson.data), ...prev])
      }
    } catch {}
    setUploading(false)
    setUploadProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleDelete = async (assetId: string) => {
    try {
      await fetch(`/api/assets?id=${assetId}`, { method: 'DELETE' })
      setAssets(prev => prev.filter(a => a.id !== assetId))
    } catch {}
  }

  const handleSort = (key: 'name' | 'time') => {
    if (sortBy === key) setSortAsc(!sortAsc)
    else { setSortBy(key); setSortAsc(false) }
  }

  const handleRename = async (assetId: string, name: string) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, name } : a))
    try {
      await fetch('/api/assets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assetId, name }),
      })
    } catch {}
  }

  const sorted = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'time') {
      return sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    return sortAsc
      ? a.name.localeCompare(b.name, 'zh')
      : b.name.localeCompare(a.name, 'zh')
  })

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">素材管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            管理游戏所需的所有素材资源 — 背景、CG、BGM、音效、语音
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-0">
        {assetCategories.map(cat => {
          const catAssets = assets.filter((a: AssetItem) => a.category === cat.id)
          const catUsed = catAssets.filter((a: AssetItem) => a.usageCount > 0).length
          const Icon = cat.icon
          const isActive = activeCategory === cat.id
          const catColors = colorMap[cat.color]
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery('') }}
              className={cn(
                'flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? `${catColors.bg} ${catColors.text} border-current`
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Icon className="h-4 w-4" />
              {cat.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                isActive ? catColors.light : 'bg-muted text-muted-foreground'
              )}>
                {catAssets.length}
              </span>
              {catUsed > 0 && (
                <span className="hidden sm:inline text-[10px] text-muted-foreground">
                  已用{catUsed}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="mb-5 flex items-center gap-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', colors.light)} />
            <span className="text-muted-foreground">总计</span>
            <span className="font-medium text-foreground">{categoryAssets.length}</span>
          </div>
        </div>
        <div className="flex-1" />
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索素材..."
            className="rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:border-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-200 w-56"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* View toggle */}
        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-pink-50 text-pink-500' : 'text-muted-foreground hover:text-foreground')}
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-pink-50 text-pink-500' : 'text-muted-foreground hover:text-foreground')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setIsGenerating(true)}
          className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors', colors.border, colors.text, `hover:${colors.bg}`)}
        >
          <Sparkles className="h-4 w-4" />
          AI 生成{currentCategory.label}
        </button>
        <div className="flex flex-col gap-1">
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? `上传中 ${uploadProgress}%...` : '上传'}
          </button>
          {uploading && (
            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-400 to-violet-400 rounded-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept={uploadCfg.accept} onChange={handleFileChange} className="hidden" />
      </div>

      {/* Asset Grid/List */}
      {filteredAssets.length > 0 ? (
        viewMode === 'grid' ? (
          <div className={cn('grid gap-4',
            activeCategory === 'cg' ? 'grid-cols-1 sm:grid-cols-2' :
            (activeCategory === 'bgm' || activeCategory === 'se') ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' :
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          )}>
            {sorted.map(asset => (
              <AssetCard
                key={asset.id}
                asset={asset}
                category={activeCategory}
                colors={colors}
                gradient={placeholderGradients[activeCategory]}
                onDelete={() => handleDelete(asset.id)}
                onRename={(name) => handleRename(asset.id, name)}
                onPlay={(a) => setPlayingAsset(a)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 列表表头 */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg">
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <button onClick={() => handleSort('name')} className="hover:text-foreground">名称{sortBy === 'name' ? (sortAsc ? ' ↑' : ' ↓') : ''}</button>
              </div>
              <span className="w-20 text-right">{isAudio ? '文件大小' : '图片大小'}</span>
              <button onClick={() => handleSort('time')} className="w-24 text-right hover:text-foreground">上传时间{sortBy === 'time' ? (sortAsc ? ' ↑' : ' ↓') : ''}</button>
              <span className="w-12 text-right">格式</span>
              <span className="w-8" />
              <span className="w-7" />
            </div>
            {sorted.map(asset => (
              <AssetListItem key={asset.id} asset={asset} colors={colors}
                onDelete={() => handleDelete(asset.id)}
                onRename={(name) => handleRename(asset.id, name)}
                onPlay={(a) => setPlayingAsset(a)} />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className={cn('flex h-16 w-16 items-center justify-center rounded-full mb-4', colors.light)}>
            <FolderOpen className={cn('h-8 w-8', colors.text)} />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? '没有找到匹配的素材' : `还没有${currentCategory.label}素材`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery ? '尝试其他关键词搜索' : '点击上方「上传」按钮添加素材'}
          </p>
        </div>
      )}

      {/* Error Dialog */}
      {errorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setErrorDialog('')}>
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-red-500 mb-2">上传失败</h3>
            <p className="text-sm text-muted-foreground">{errorDialog}</p>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setErrorDialog('')} className="rounded-lg bg-red-500 px-4 py-2 text-xs text-white font-medium">知道了</button>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player Bar */}
      {playingAsset && (
        <AudioPlayerBar asset={playingAsset} onClose={() => setPlayingAsset(null)} />
      )}

      {/* AI Generate Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">AI 生成{currentCategory.label}</h3>
              <button onClick={() => setIsGenerating(false)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">描述</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-200 resize-none"
                  rows={3}
                  placeholder={
                    activeCategory === 'background' ? '如：白天的教室，阳光从窗户洒入，课桌整齐排列' :
                    activeCategory === 'cg' ? '如：樱花树下的初次相遇，两人四目相对，花瓣飘落' :
                    activeCategory === 'bgm' ? '如：轻快的钢琴曲，春天校园的日常氛围' :
                    activeCategory === 'se' ? '如：教室里的脚步声，木地板质感' :
                    '如：女主角的开场问候，温柔甜美的声线'
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">生成数量</label>
                <div className="mt-1 flex items-center gap-3">
                  <input type="range" min={1} max={6} defaultValue={2} className="flex-1 accent-pink-500" />
                  <span className="text-sm font-medium text-foreground w-8 text-center">2</span>
                </div>
              </div>
              {activeCategory === 'bgm' && (
                <div>
                  <label className="text-sm font-medium text-foreground">时长</label>
                  <select className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-pink-300 focus:outline-none">
                    <option>30秒</option>
                    <option>1分钟</option>
                    <option>2分钟</option>
                    <option>3分钟</option>
                  </select>
                </div>
              )}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setIsGenerating(false)}
                  className="flex-1 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => setIsGenerating(false)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:shadow-md transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  开始生成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
