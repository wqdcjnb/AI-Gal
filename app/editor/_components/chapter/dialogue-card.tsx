'use client'

import { useState } from 'react'
import { Settings, HelpCircle, ChevronRight, ImageIcon } from 'lucide-react'
import { mockCharacters } from '@/app/editor/_lib/mock-data'
import type { DialogueCardProps } from '@/app/editor/_lib/types'

export function DialogueCard({ dialogue, index, onUpdate }: DialogueCardProps) {
  const [showSettings, setShowSettings] = useState(false)

  // Check if dialogue has any presentation settings
  const hasSettings = dialogue.spriteExpression || dialogue.bgmChange || dialogue.soundEffect || dialogue.cgTrigger || dialogue.textSpeed || (dialogue.screenEffect && dialogue.screenEffect !== 'none')

  if (dialogue.type === 'narration') {
    return (
      <div className="group rounded-lg border border-border bg-muted/30 p-3 hover:border-pink-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">旁白</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
          <div className="flex items-center gap-1 ml-2">
            {dialogue.spriteExpression && (
              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-600" title={`表情: ${dialogue.spriteExpression}`}>
                🎭 {dialogue.spriteExpression}
              </span>
            )}
            {dialogue.bgmChange && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600" title={`BGM: ${dialogue.bgmChange}`}>
                🎵
              </span>
            )}
            {dialogue.soundEffect && (
              <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600" title={`音效: ${dialogue.soundEffect}`}>
                🔊
              </span>
            )}
            {dialogue.cgTrigger && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600" title={`CG: ${dialogue.cgTrigger}`}>
                🖼️
              </span>
            )}
            {dialogue.screenEffect && dialogue.screenEffect !== 'none' && (
              <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600" title={`特效: ${dialogue.screenEffect}`}>
                ⚡
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`ml-auto rounded p-1 text-xs transition-colors ${hasSettings ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
        <p className="text-sm italic text-muted-foreground">{dialogue.content}</p>
        {showSettings && (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings className="h-3 w-3" />
              演出设置
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">🎭 立绘表情</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  placeholder="如: 微笑、惊讶、哭泣"
                  value={dialogue.spriteExpression || ''}
                  onChange={(e) => onUpdate?.({ ...dialogue, spriteExpression: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">⏱️ 文字速度</label>
                <select
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  value={dialogue.textSpeed || 'normal'}
                  onChange={(e) => onUpdate?.({ ...dialogue, textSpeed: e.target.value as 'slow' | 'normal' | 'fast' })}
                >
                  <option value="slow">慢速</option>
                  <option value="normal">正常</option>
                  <option value="fast">快速</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">🎵 BGM 变化</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  placeholder="BGM名称"
                  value={dialogue.bgmChange || ''}
                  onChange={(e) => onUpdate?.({ ...dialogue, bgmChange: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">🔊 音效</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  placeholder="如: 脚步声、开门声"
                  value={dialogue.soundEffect || ''}
                  onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">🖼️ CG 触发</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  placeholder="CG名称"
                  value={dialogue.cgTrigger || ''}
                  onChange={(e) => onUpdate?.({ ...dialogue, cgTrigger: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">⚡ 画面特效</label>
                <select
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none"
                  value={dialogue.screenEffect || 'none'}
                  onChange={(e) => onUpdate?.({ ...dialogue, screenEffect: e.target.value as 'none' | 'shake' | 'flash_white' | 'flash_black' })}
                >
                  <option value="none">无</option>
                  <option value="shake">震动</option>
                  <option value="flash_white">闪白</option>
                  <option value="flash_black">闪黑</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (dialogue.type === 'choice') {
    const funcTypeConfig: Record<string, { icon: string; label: string; color: string }> = {
      branch: { icon: '🔀', label: '剧情分支', color: 'bg-amber-100 text-amber-700 border-amber-200' },
      affection: { icon: '💗', label: '好感度', color: 'bg-pink-100 text-pink-700 border-pink-200' },
      flavor: { icon: '🎭', label: '趣味', color: 'bg-slate-100 text-slate-600 border-slate-200' },
      trap: { icon: '⚠️', label: '陷阱', color: 'bg-red-100 text-red-700 border-red-200' },
    }

    return (
      <div className="group rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-4 w-4 text-amber-600" />
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">选择支</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`ml-auto rounded p-1 text-xs transition-colors ${hasSettings ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>
        <p className="text-sm font-medium text-foreground mb-3">{dialogue.content}</p>
        {dialogue.choices && dialogue.choices.length > 0 && (
          <div className="space-y-2">
            {dialogue.choices.map((choice, cIndex) => {
              const choiceType = choice.type || 'normal'
              const funcType = choice.functionType || 'branch'
              const funcConfig = funcTypeConfig[funcType]
              return (
                <div key={cIndex} className={`flex flex-col gap-1 rounded-md border px-3 py-2 ${
                  choiceType === 'hidden' ? 'border-purple-200 bg-purple-50/50' :
                  choiceType === 'timed' ? 'border-red-200 bg-red-50/50' :
                  choice.isBadEnd ? 'border-red-300 bg-red-50/30' :
                  'border-amber-200 bg-white/60'
                }`}>
                  <div className="flex items-center gap-2">
                    <ChevronRight className={`h-3 w-3 shrink-0 ${
                      choiceType === 'hidden' ? 'text-purple-600' :
                      choiceType === 'timed' ? 'text-red-600' :
                      choice.isBadEnd ? 'text-red-600' :
                      'text-amber-600'
                    }`} />
                    <span className="text-sm text-foreground">{choice.text}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] ${funcConfig.color}`} title={funcConfig.label}>
                      {funcConfig.icon} {funcConfig.label}
                    </span>
                    {choiceType === 'hidden' && (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">隐藏</span>
                    )}
                    {choiceType === 'timed' && choice.timeout && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">⏱ {choice.timeout}秒</span>
                    )}
                    {choice.isBadEnd && (
                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-700 font-medium">Bad End</span>
                    )}
                    {choice.condition && (
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600" title={`条件: ${choice.condition}`}>
                        🔒 条件
                      </span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">
                      → {choice.targetSubSectionId ? `小节 ${choice.targetSubSectionId.slice(-1)}` : '未设置'}
                    </span>
                  </div>
                  {choice.effects && choice.effects.length > 0 && (
                    <div className="flex items-center gap-1 ml-5 mt-1">
                      <span className="text-[10px] text-muted-foreground">效果:</span>
                      {choice.effects.map((effect, eIndex) => (
                        <span key={eIndex} className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600">
                          {effect.type === 'affection' ? `好感度` : 'Flag'} {effect.operator === 'add' ? '+' : effect.operator === 'subtract' ? '-' : '='} {String(effect.value)}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-2 ml-5 mt-1">
                    <select
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] focus:border-pink-300 focus:outline-none"
                      value={funcType}
                      onChange={(e) => {
                        const newChoices = [...(dialogue.choices || [])]
                        newChoices[cIndex] = { ...choice, functionType: e.target.value as 'branch' | 'affection' | 'flavor' | 'trap' }
                        onUpdate?.({ ...dialogue, choices: newChoices })
                      }}
                    >
                      <option value="branch">🔀 剧情分支</option>
                      <option value="affection">💗 好感度</option>
                      <option value="flavor">🎭 趣味</option>
                      <option value="trap">⚠️ 陷阱</option>
                    </select>
                    <label className="flex items-center gap-1 text-[10px] text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-border"
                        checked={choice.isBadEnd || false}
                        onChange={(e) => {
                          const newChoices = [...(dialogue.choices || [])]
                          newChoices[cIndex] = { ...choice, isBadEnd: e.target.checked }
                          onUpdate?.({ ...dialogue, choices: newChoices })
                        }}
                      />
                      <span className={choice.isBadEnd ? 'text-red-600' : ''}>Bad End</span>
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {showSettings && (
          <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Settings className="h-3 w-3" />
              演出设置
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">🎵 BGM 变化</label>
                <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="BGM名称" value={dialogue.bgmChange || ''} onChange={(e) => onUpdate?.({ ...dialogue, bgmChange: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">🔊 音效</label>
                <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="如: 脚步声、开门声" value={dialogue.soundEffect || ''} onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">🖼️ CG 触发</label>
                <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="CG名称" value={dialogue.cgTrigger || ''} onChange={(e) => onUpdate?.({ ...dialogue, cgTrigger: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">⚡ 画面特效</label>
                <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" value={dialogue.screenEffect || 'none'} onChange={(e) => onUpdate?.({ ...dialogue, screenEffect: e.target.value as 'none' | 'shake' | 'flash_white' | 'flash_black' })}>
                  <option value="none">无</option>
                  <option value="shake">震动</option>
                  <option value="flash_white">闪白</option>
                  <option value="flash_black">闪黑</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Character dialogue
  const char = mockCharacters.find(c => c.id === dialogue.characterId)
  const charSprites = char?.sprites || []
  const currentSprite = charSprites.find(s => s.id === dialogue.spriteId) || charSprites.find(s => s.type === 'base')

  return (
    <div className="group rounded-lg border border-border bg-card p-3 hover:border-pink-200">
      <div className="flex items-center gap-2 mb-2">
        {char && (
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-medium"
            style={{ backgroundColor: char.color }}
          >
            {char.name[0]}
          </div>
        )}
        <span className="text-sm font-medium" style={{ color: char?.color || '#666' }}>
          {dialogue.characterName || '未知角色'}
        </span>
        <span className="text-xs text-muted-foreground">#{index + 1}</span>
        <div className="flex items-center gap-1 ml-2">
          {dialogue.spriteExpression && (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-600" title={`表情: ${dialogue.spriteExpression}`}>🎭 {dialogue.spriteExpression}</span>
          )}
          {dialogue.bgmChange && (
            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600" title={`BGM: ${dialogue.bgmChange}`}>🎵</span>
          )}
          {dialogue.soundEffect && (
            <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600" title={`音效: ${dialogue.soundEffect}`}>🔊</span>
          )}
          {dialogue.cgTrigger && (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-600" title={`CG: ${dialogue.cgTrigger}`}>🖼️</span>
          )}
          {dialogue.screenEffect && dialogue.screenEffect !== 'none' && (
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600" title={`特效: ${dialogue.screenEffect}`}>⚡</span>
          )}
        </div>
        {charSprites.length > 0 && (
          <select
            className="rounded border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground hover:border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-300"
            value={dialogue.spriteId || currentSprite?.id || ''}
            onChange={(e) => onUpdate?.({ ...dialogue, spriteId: e.target.value })}
          >
            {charSprites.map(sprite => (
              <option key={sprite.id} value={sprite.id}>
                {sprite.name} ({sprite.type === 'base' ? '基础' : sprite.type === 'expression' ? '表情' : sprite.type === 'outfit' ? '服装' : '动作'})
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`ml-auto rounded p-1 text-xs transition-colors ${hasSettings ? 'text-pink-500' : 'text-muted-foreground hover:text-pink-400'}`}
        >
          <Settings className="h-3 w-3" />
        </button>
      </div>
      <p className="text-sm text-foreground">{dialogue.content}</p>
      {currentSprite && (
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          <span>立绘: {currentSprite.name}</span>
          {dialogue.spriteExpression && <span className="text-violet-500">({dialogue.spriteExpression})</span>}
        </div>
      )}
      {showSettings && (
        <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Settings className="h-3 w-3" />
            演出设置
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">🎭 立绘表情</label>
              <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="如: 微笑、惊讶、哭泣" value={dialogue.spriteExpression || ''} onChange={(e) => onUpdate?.({ ...dialogue, spriteExpression: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">⏱️ 文字速度</label>
              <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" value={dialogue.textSpeed || 'normal'} onChange={(e) => onUpdate?.({ ...dialogue, textSpeed: e.target.value as 'slow' | 'normal' | 'fast' })}>
                <option value="slow">慢速</option>
                <option value="normal">正常</option>
                <option value="fast">快速</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">🎵 BGM 变化</label>
              <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="BGM名称" value={dialogue.bgmChange || ''} onChange={(e) => onUpdate?.({ ...dialogue, bgmChange: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">🔊 音效</label>
              <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="如: 脚步声、开门声" value={dialogue.soundEffect || ''} onChange={(e) => onUpdate?.({ ...dialogue, soundEffect: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">🖼️ CG 触发</label>
              <input type="text" className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" placeholder="CG名称" value={dialogue.cgTrigger || ''} onChange={(e) => onUpdate?.({ ...dialogue, cgTrigger: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">⚡ 画面特效</label>
              <select className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-xs focus:border-pink-300 focus:outline-none" value={dialogue.screenEffect || 'none'} onChange={(e) => onUpdate?.({ ...dialogue, screenEffect: e.target.value as 'none' | 'shake' | 'flash_white' | 'flash_black' })}>
                <option value="none">无</option>
                <option value="shake">震动</option>
                <option value="flash_white">闪白</option>
                <option value="flash_black">闪黑</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
