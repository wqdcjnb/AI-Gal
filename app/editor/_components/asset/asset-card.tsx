'use client'

import { Eye, Upload, ImageIcon, Music2, Volume2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetItem, AssetCategory } from '@/app/editor/_lib/types'

export function AssetCard({ asset, category, colors, gradient }: {
  asset: AssetItem
  category: AssetCategory
  colors: { bg: string; text: string; border: string; light: string; gradient: string }
  gradient: string
}) {
  const isAudio = category === 'bgm' || category === 'se' || category === 'voice'

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover:border-pink-200 hover:shadow-md transition-all cursor-pointer">
      {/* Preview area */}
      <div className={cn('relative aspect-[4/3] bg-gradient-to-br', gradient, 'flex items-center justify-center')}>
        {isAudio ? (
          /* Audio waveform placeholder */
          <div className="flex items-center gap-0.5 px-4 w-full">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = 20 + ((i * 37 + 13) % 60)
              const o = 0.4 + ((i * 23 + 7) % 60) / 100
              return (
                <div
                  key={i}
                  className={cn('flex-1 rounded-full', category === 'bgm' ? 'bg-blue-300/60' : category === 'se' ? 'bg-green-300/60' : 'bg-violet-300/60')}
                  style={{ height: `${h}%`, opacity: o }}
                />
              )
            })}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
                {category === 'bgm' ? <Music2 className="h-5 w-5 text-blue-500" /> :
                 category === 'se' ? <Volume2 className="h-5 w-5 text-green-500" /> :
                 <Mic className="h-5 w-5 text-violet-500" />}
              </div>
            </div>
          </div>
        ) : (
          /* Image placeholder */
          <div className="flex flex-col items-center gap-2">
            {category === 'background' ? <ImageIcon className="h-8 w-8 text-emerald-400/60" /> :
             <Eye className="h-8 w-8 text-amber-400/60" />}
            <span className="text-xs text-muted-foreground/60">{asset.name}</span>
          </div>
        )}
        {/* Status badge */}
        {asset.status === 'placeholder' && (
          <div className="absolute top-2 right-2 rounded bg-gray-200/80 px-1.5 py-0.5 text-[10px] text-gray-500 backdrop-blur-sm">
            占位
          </div>
        )}
        {/* Usage badge */}
        {asset.usageCount > 0 && (
          <div className="absolute top-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] text-foreground backdrop-blur-sm">
            使用 {asset.usageCount} 次
          </div>
        )}
        {/* CG-specific badges */}
        {asset.category === 'cg' && asset.hasDiff && (
          <div className="absolute bottom-2 left-2 rounded bg-violet-500/80 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            {asset.diffCount || 0} 差分
          </div>
        )}
        {asset.category === 'cg' && asset.plotNode && (
          <div className="absolute bottom-2 right-2 rounded bg-amber-500/80 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
            📍 {asset.plotNode}
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="flex gap-2">
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
              <Eye className="h-4 w-4 text-foreground" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors">
              <Upload className="h-4 w-4 text-foreground" />
            </button>
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <h4 className="text-sm font-medium text-foreground truncate">{asset.name}</h4>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {asset.tags.slice(0, 3).map(tag => (
            <span key={tag} className={cn('rounded px-1.5 py-0.5 text-[10px]', colors.bg, colors.text)}>
              {tag}
            </span>
          ))}
        </div>
        {asset.usedIn.length > 0 && (
          <div className="mt-2 text-[10px] text-muted-foreground truncate">
            用于: {asset.usedIn.join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}
