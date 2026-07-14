'use client'

import { useState } from 'react'
import { ChevronRight, Settings, ImageIcon, Music, MessageSquare, Quote, User, HelpCircle, Sparkles, GitMerge } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubSection, SubSectionCardProps } from '@/app/editor/_lib/types'
import { DialogueCard } from '@/app/editor/_components/chapter/dialogue-card'

// Ending type config (local to avoid import)
const endingConfigLabels: Record<string, { label: string; color: string; icon: string }> = {
  GE: { label: 'Good End', color: 'bg-green-100 text-green-700 border-green-200', icon: '🌸' },
  NE: { label: 'Normal End', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🌿' },
  BE: { label: 'Bad End', color: 'bg-red-100 text-red-700 border-red-200', icon: '💀' },
  TE: { label: 'True End', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⭐' },
}

export function SubSectionCard({ subSection, index, isExpanded, onToggle, onUpdate }: SubSectionCardProps) {
  const [showSceneControls, setShowSceneControls] = useState(false)
  const hasSceneSettings = subSection.timeOfDay || subSection.weather || subSection.transition || subSection.perspective
  const hasBranchSettings = subSection.isMergePoint || subSection.endingType || subSection.routeName

  return (
    <div className={`rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
      subSection.endingType ? 'border-amber-300 ring-1 ring-amber-100' :
      subSection.isMergePoint ? 'border-violet-300 ring-1 ring-violet-100' :
      'border-border'
    }`}>
      {/* Sub-section Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggle}
      >
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          subSection.endingType ? 'bg-gradient-to-br from-amber-100 to-orange-100 text-amber-700' :
          subSection.isMergePoint ? 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700' :
          'bg-gradient-to-br from-pink-100 to-violet-100 text-pink-600'
        }`}>
          {subSection.endingType ? endingConfigLabels[subSection.endingType]?.icon :
           subSection.isMergePoint ? '⚡' : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{subSection.title}</h4>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="h-3 w-3" />
              {subSection.background}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Music className="h-3 w-3" />
              {subSection.bgm}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              {subSection.dialogues.length} 条对话
            </span>
            {subSection.timeOfDay && (
              <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                🕐 {subSection.timeOfDay}
              </span>
            )}
            {subSection.weather && subSection.weather !== 'none' && (
              <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 rounded px-1.5 py-0.5">
                🌤️ {subSection.weather}
              </span>
            )}
            {subSection.transition && subSection.transition !== 'cut' && (
              <span className="flex items-center gap-1 text-xs text-violet-600 bg-violet-50 rounded px-1.5 py-0.5">
                ✨ {subSection.transition === 'fade' ? '淡入' : subSection.transition === 'dissolve' ? '溶解' : subSection.transition === 'wipe' ? '擦除' : subSection.transition}
              </span>
            )}
            {subSection.isMergePoint && (
              <span className="flex items-center gap-1 text-xs text-violet-700 bg-violet-100 border border-violet-200 rounded px-1.5 py-0.5">
                ⚡ 汇合点
              </span>
            )}
            {subSection.routeName && (
              <span className="flex items-center gap-1 text-xs text-pink-700 bg-pink-100 border border-pink-200 rounded px-1.5 py-0.5">
                🎀 {subSection.routeName}
              </span>
            )}
            {subSection.endingType && endingConfigLabels[subSection.endingType] && (
              <span className={`flex items-center gap-1 text-xs border rounded px-1.5 py-0.5 font-medium ${endingConfigLabels[subSection.endingType].color}`}>
                {endingConfigLabels[subSection.endingType].icon} {endingConfigLabels[subSection.endingType].label}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowSceneControls(!showSceneControls)
          }}
          className={`rounded p-1.5 transition-colors ${hasSceneSettings || hasBranchSettings ? 'text-pink-500 bg-pink-50' : 'text-muted-foreground hover:text-pink-400 hover:bg-pink-50'}`}
          title="场景与分支设置"
        >
          <Settings className="h-4 w-4" />
        </button>
        <ChevronRight className={cn(
          'h-5 w-5 text-muted-foreground transition-transform',
          isExpanded && 'rotate-90'
        )} />
      </div>

      {/* Scene Controls Panel */}
      {showSceneControls && (
        <div className="border-b border-border bg-gradient-to-r from-pink-50/50 to-violet-50/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="h-4 w-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground">场景控制</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">🕐 时间</label>
              <select
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                value={subSection.timeOfDay || 'none'}
                onChange={(e) => onUpdate?.({ ...subSection, timeOfDay: e.target.value as SubSection['timeOfDay'] })}
              >
                <option value="none">无</option>
                <option value="dawn">黎明</option>
                <option value="morning">早晨</option>
                <option value="noon">正午</option>
                <option value="afternoon">午后</option>
                <option value="evening">傍晚</option>
                <option value="night">夜晚</option>
                <option value="midnight">深夜</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">🌤️ 天气</label>
              <select
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                value={subSection.weather || 'none'}
                onChange={(e) => onUpdate?.({ ...subSection, weather: e.target.value as 'none' | 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' })}
              >
                <option value="none">无</option>
                <option value="sunny">晴天</option>
                <option value="cloudy">多云</option>
                <option value="rainy">雨天</option>
                <option value="snowy">雪天</option>
                <option value="stormy">暴风雨</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">✨ 转场</label>
              <select
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                value={subSection.transition || 'cut'}
                onChange={(e) => onUpdate?.({ ...subSection, transition: e.target.value as 'cut' | 'fade' | 'dissolve' | 'wipe' })}
              >
                <option value="cut">硬切</option>
                <option value="fade">淡入淡出</option>
                <option value="dissolve">溶解</option>
                <option value="wipe">擦除</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">👁️ 视角</label>
              <select
                className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                value={subSection.perspective || 'first_person'}
                onChange={(e) => onUpdate?.({ ...subSection, perspective: e.target.value as 'first_person' | 'third_person' | 'overhead' | 'side_view' })}
              >
                <option value="first_person">第一人称</option>
                <option value="third_person">第三人称</option>
                <option value="overhead">俯视角</option>
                <option value="side_view">侧视角</option>
              </select>
            </div>
          </div>
          {/* Branch & Ending Settings */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <GitMerge className="h-4 w-4 text-violet-500" />
              <span className="text-sm font-medium text-foreground">分支与结局</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={subSection.isMergePoint || false}
                    onChange={(e) => onUpdate?.({ ...subSection, isMergePoint: e.target.checked })}
                  />
                  ⚡ 汇合点
                </label>
                <p className="text-[10px] text-muted-foreground mt-1">多条分支在此汇合</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">🏁 结局类型</label>
                <select
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                  value={subSection.endingType || ''}
                  onChange={(e) => onUpdate?.({ ...subSection, endingType: (e.target.value || undefined) as SubSection['endingType'] })}
                >
                  <option value="">无</option>
                  <option value="GE">🌸 Good End</option>
                  <option value="NE">🌿 Normal End</option>
                  <option value="BE">💀 Bad End</option>
                  <option value="TE">⭐ True End</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted-foreground">🎀 所属路线</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1.5 text-xs focus:border-pink-300 focus:outline-none"
                  placeholder="如: 樱线、雪菜线、共通线"
                  value={subSection.routeName || ''}
                  onChange={(e) => onUpdate?.({ ...subSection, routeName: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-section Content (Expanded) */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-4">
          <div className="flex items-center gap-4 mb-4 rounded-lg bg-card border border-border p-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">背景:</span>
              <span className="text-sm text-foreground">{subSection.background}</span>
            </div>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">BGM:</span>
              <span className="text-sm text-foreground">{subSection.bgm}</span>
            </div>
          </div>

          {/* Dialogue List */}
          <div className="space-y-3">
            {subSection.dialogues.map((dialogue, dIndex) => (
              <DialogueCard
                key={dialogue.id}
                dialogue={dialogue}
                index={dIndex}
              />
            ))}
          </div>

          {/* Add Dialogue Buttons */}
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-border">
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <Quote className="h-4 w-4" />
              旁白
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <User className="h-4 w-4" />
              角色对话
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground hover:border-pink-200 hover:text-pink-600 transition-colors">
              <HelpCircle className="h-4 w-4" />
              选择支
            </button>
            <div className="flex-1" />
            <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all">
              <Sparkles className="h-4 w-4" />
              AI 生成
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
