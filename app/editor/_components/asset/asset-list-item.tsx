import { Eye, ImageIcon, Music2, Volume2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetItem } from '@/app/editor/_lib/types'

export function AssetListItem({ asset, colors }: {
  asset: AssetItem
  colors: { bg: string; text: string; border: string; light: string; gradient: string }
}) {
  return (
    <div className="grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 border-b border-border px-4 py-3 hover:bg-muted/20 transition-colors items-center">
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded', colors.light)}>
          {asset.category === 'bgm' ? <Music2 className={cn('h-4 w-4', colors.text)} /> :
           asset.category === 'se' ? <Volume2 className={cn('h-4 w-4', colors.text)} /> :
           asset.category === 'voice' ? <Mic className={cn('h-4 w-4', colors.text)} /> :
           asset.category === 'cg' ? <Eye className={cn('h-4 w-4', colors.text)} /> :
           <ImageIcon className={cn('h-4 w-4', colors.text)} />}
        </div>
        <span className="text-sm text-foreground truncate">{asset.name}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {asset.tags.slice(0, 2).map(tag => (
          <span key={tag} className={cn('rounded px-1.5 py-0.5 text-[10px]', colors.bg, colors.text)}>
            {tag}
          </span>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{asset.usageCount} 次</span>
      <span className="text-xs text-muted-foreground truncate">
        {asset.usedIn.length > 0 ? asset.usedIn.join(', ') : '未使用'}
      </span>
      <span className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium text-center',
        asset.status === 'generated' ? 'bg-green-100 text-green-600' :
        asset.status === 'uploaded' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-500'
      )}>
        {asset.status === 'generated' ? '已生成' : asset.status === 'uploaded' ? '已上传' : '占位'}
      </span>
    </div>
  )
}
