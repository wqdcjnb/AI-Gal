'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Edit3, Trash2, Sparkles, Loader2, Users, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import type { Character, Sprite } from '@/app/editor/_lib/types'

export default function CharactersPage() {
  const { project } = useProject()
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)

  // Load characters from localStorage or use mock data
  useEffect(() => {
    if (!project) return
    const saved = localStorage.getItem(`ai-gal-characters-${project.id}`)
    if (saved) {
      setCharacters(JSON.parse(saved))
    } else {
      // Initialize with mock characters
      const initialChars: Character[] = [
        {
          id: 'c1', name: '桜', color: '#ec4899', personality: '温柔内向', description: '转学生，喜欢文学，经常在樱花树下看书',
          sprites: [
            { id: 's1-1', characterId: 'c1', name: '通常', type: 'base', url: '', tags: ['默认'] },
            { id: 's1-2', characterId: 'c1', name: '微笑', type: 'expression', url: '', tags: ['开心'] },
            { id: 's1-3', characterId: 'c1', name: '惊讶', type: 'expression', url: '', tags: ['意外'] },
            { id: 's1-4', characterId: 'c1', name: '哭泣', type: 'expression', url: '', tags: ['悲伤'] },
            { id: 's1-5', characterId: 'c1', name: '愤怒', type: 'expression', url: '', tags: ['生气'] },
            { id: 's1-6', characterId: 'c1', name: '害羞', type: 'expression', url: '', tags: ['脸红'] },
            { id: 's1-7', characterId: 'c1', name: '制服', type: 'outfit', url: '', tags: ['校服'] },
            { id: 's1-8', characterId: 'c1', name: '便服', type: 'outfit', url: '', tags: ['私服'] },
          ]
        },
        {
          id: 'c2', name: '主人公', color: '#3b82f6', personality: '开朗乐观', description: '普通高中生，喜欢观察身边的人',
          sprites: [
            { id: 's2-1', characterId: 'c2', name: '通常', type: 'base', url: '', tags: ['默认'] },
            { id: 's2-2', characterId: 'c2', name: '微笑', type: 'expression', url: '', tags: ['开心'] },
            { id: 's2-3', characterId: 'c2', name: '惊讶', type: 'expression', url: '', tags: ['意外'] },
          ]
        },
        {
          id: 'c3', name: '雪乃', color: '#8b5cf6', personality: '高冷傲娇', description: '学生会长，成绩优秀，外表冷淡内心善良',
          sprites: [
            { id: 's3-1', characterId: 'c3', name: '通常', type: 'base', url: '', tags: ['默认'] },
            { id: 's3-2', characterId: 'c3', name: '傲娇', type: 'expression', url: '', tags: ['害羞'] },
            { id: 's3-3', characterId: 'c3', name: '微笑', type: 'expression', url: '', tags: ['温柔'] },
            { id: 's3-4', characterId: 'c3', name: '制服', type: 'outfit', url: '', tags: ['校服'] },
          ]
        },
      ]
      setCharacters(initialChars)
      localStorage.setItem(`ai-gal-characters-${project.id}`, JSON.stringify(initialChars))
    }
  }, [project])

  // Auto-select first character
  useEffect(() => {
    if (!selectedCharId && characters.length > 0) {
      setSelectedCharId(characters[0].id)
    }
  }, [characters, selectedCharId])

  if (!project) return null

  const saveCharacters = (chars: Character[]) => {
    setCharacters(chars)
    localStorage.setItem(`ai-gal-characters-${project.id}`, JSON.stringify(chars))
  }

  const addCharacter = () => {
    const newChar: Character = {
      id: `c${Date.now()}`,
      name: '新角色',
      color: '#6b7280',
      personality: '',
      description: '',
      sprites: [{ id: `s-${Date.now()}`, characterId: `c${Date.now()}`, name: '通常', type: 'base', url: '', tags: ['默认'] }],
    }
    saveCharacters([...characters, newChar])
    setSelectedCharId(newChar.id)
  }

  const deleteCharacter = (id: string) => {
    saveCharacters(characters.filter(c => c.id !== id))
    if (selectedCharId === id) {
      const remaining = characters.filter(c => c.id !== id)
      setSelectedCharId(remaining.length > 0 ? remaining[0].id : null)
    }
  }

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    saveCharacters(characters.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addSprite = (charId: string, type: Sprite['type']) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    const newSprite: Sprite = {
      id: `s-${Date.now()}`,
      characterId: charId,
      name: type === 'base' ? '通常' : type === 'expression' ? '新表情' : type === 'outfit' ? '新服装' : '新动作',
      type,
      url: '',
      tags: [],
    }
    updateCharacter(charId, { sprites: [...(char.sprites || []), newSprite] })
  }

  const deleteSprite = (charId: string, spriteId: string) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    updateCharacter(charId, { sprites: (char.sprites || []).filter(s => s.id !== spriteId) })
  }

  const updateSprite = (charId: string, spriteId: string, updates: Partial<Sprite>) => {
    const char = characters.find(c => c.id === charId)
    if (!char) return
    updateCharacter(charId, {
      sprites: (char.sprites || []).map(s => s.id === spriteId ? { ...s, ...updates } : s)
    })
  }

  const selectedChar = characters.find(c => c.id === selectedCharId)

  const getSpritesByType = (type: Sprite['type']) => {
    if (!selectedChar) return []
    return (selectedChar.sprites || []).filter(s => s.type === type)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Character Selector Bar */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedCharId(char.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                selectedCharId === char.id
                  ? "bg-pink-50 border border-pink-200 text-pink-700"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {char.avatar ? (
                <img src={char.avatar} alt={char.name} className="h-6 w-6 rounded-full object-cover" />
              ) : (
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: char.color }}
                >
                  {char.name[0]}
                </div>
              )}
              <span className="text-sm font-medium">{char.name}</span>
              <span className="text-xs text-muted-foreground">({(char.sprites || []).length})</span>
            </button>
          ))}
          <button
            onClick={addCharacter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-pink-200 text-pink-500 hover:bg-pink-50/50 transition-all whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">添加角色</span>
          </button>
        </div>
      </div>

      {/* Main Content - Sprite Gallery */}
      <div className="flex-1 overflow-auto p-6">
        {selectedChar ? (
          <div className="max-w-5xl mx-auto">
            {/* Character Header */}
            <div className="flex gap-6 mb-8 pb-6 border-b border-border">
              {/* Base Sprite Preview */}
              <div className="flex-shrink-0">
                <div className="w-40 h-56 rounded-xl bg-gradient-to-b from-pink-50 to-violet-50 border border-pink-100 flex items-center justify-center overflow-hidden">
                  {selectedChar.avatar ? (
                    <img src={selectedChar.avatar} alt={selectedChar.name} className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-white text-5xl font-bold"
                      style={{ backgroundColor: selectedChar.color }}
                    >
                      {selectedChar.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => setIsGenerating(`avatar-${selectedChar.id}`)}
                    disabled={isGenerating !== null}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-pink-200 bg-pink-50 px-2 py-1.5 text-xs font-medium text-pink-600 hover:bg-pink-100 disabled:opacity-50"
                  >
                    {isGenerating === `avatar-${selectedChar.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    AI 头像
                  </button>
                </div>
              </div>

              {/* Character Info */}
              <div className="flex-1">
                {isEditingInfo ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={selectedChar.name}
                      onChange={(e) => updateCharacter(selectedChar.id, { name: e.target.value })}
                      className="w-full text-xl font-semibold rounded-lg border border-border px-3 py-2 focus:border-pink-300 focus:outline-none"
                      placeholder="角色名称"
                    />
                    <input
                      type="text"
                      value={selectedChar.personality || ''}
                      onChange={(e) => updateCharacter(selectedChar.id, { personality: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                      placeholder="性格特点（如：温柔内向、傲娇）"
                    />
                    <textarea
                      value={selectedChar.description || ''}
                      onChange={(e) => updateCharacter(selectedChar.id, { description: e.target.value })}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm resize-none focus:border-pink-300 focus:outline-none"
                      placeholder="角色描述..."
                      rows={2}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">对话颜色:</span>
                      <input
                        type="color"
                        value={selectedChar.color}
                        onChange={(e) => updateCharacter(selectedChar.id, { color: e.target.value })}
                        className="h-8 w-8 rounded border border-border cursor-pointer"
                      />
                      <div className="flex gap-1">
                        {['#ec4899', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                          <button
                            key={color}
                            onClick={() => updateCharacter(selectedChar.id, { color })}
                            className="h-6 w-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingInfo(false)}
                      className="text-sm text-pink-500 hover:text-pink-600"
                    >
                      完成编辑
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{selectedChar.name}</h2>
                        <p className="text-muted-foreground mt-1">「{selectedChar.description || '暂无描述'}」</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingInfo(true)}
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          编辑信息
                        </button>
                        <button
                          onClick={() => deleteCharacter(selectedChar.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          删除
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: selectedChar.color }} />
                        <span className="text-sm text-muted-foreground">对话颜色</span>
                      </div>
                      {selectedChar.personality && (
                        <div className="flex items-center gap-1.5">
                          {selectedChar.personality.split(/[,，/]/).map((tag, i) => (
                            <span key={i} className="rounded-md bg-pink-50 border border-pink-100 px-2 py-0.5 text-xs text-pink-600">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-sm text-muted-foreground">
                        立绘: {(selectedChar.sprites || []).length} 张
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Expression Sprites */}
            <SpriteSection
              title="表情差分"
              icon="📋"
              color="blue"
              sprites={getSpritesByType('expression')}
              onAdd={() => addSprite(selectedChar.id, 'expression')}
              onDelete={(spriteId) => deleteSprite(selectedChar.id, spriteId)}
              onUpdate={(spriteId, updates) => updateSprite(selectedChar.id, spriteId, updates)}
            />

            {/* Outfit Sprites */}
            <SpriteSection
              title="服装差分"
              icon="👗"
              color="green"
              sprites={getSpritesByType('outfit')}
              onAdd={() => addSprite(selectedChar.id, 'outfit')}
              onDelete={(spriteId) => deleteSprite(selectedChar.id, spriteId)}
              onUpdate={(spriteId, updates) => updateSprite(selectedChar.id, spriteId, updates)}
            />

            {/* Pose Sprites */}
            <SpriteSection
              title="动作差分"
              icon="🎭"
              color="purple"
              sprites={getSpritesByType('pose')}
              onAdd={() => addSprite(selectedChar.id, 'pose')}
              onDelete={(spriteId) => deleteSprite(selectedChar.id, spriteId)}
              onUpdate={(spriteId, updates) => updateSprite(selectedChar.id, spriteId, updates)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 mb-4">
              <Users className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">还没有角色</h3>
            <p className="text-sm text-muted-foreground mb-4">点击「添加角色」开始创建你的游戏角色</p>
            <button
              onClick={addCharacter}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus className="h-4 w-4" />
              添加角色
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Sprite Section sub-component
function SpriteSection({
  title,
  icon,
  color,
  sprites,
  charId,
  onAdd,
  onDelete,
  onUpdate,
}: {
  title: string
  icon: string
  color: string
  sprites: Sprite[]
  onAdd: () => void
  onDelete: (spriteId: string) => void
  onUpdate: (spriteId: string, updates: Partial<Sprite>) => void
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; light: string; gradient: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', light: 'bg-blue-50', gradient: 'from-blue-50 to-white' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', light: 'bg-green-50', gradient: 'from-green-50 to-white' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', light: 'bg-purple-50', gradient: 'from-purple-50 to-white' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', c.bg, c.text)}>{icon}</span>
          {title}
        </h3>
        <button
          onClick={onAdd}
          className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:opacity-80', c.border, c.bg, c.text)}
        >
          <Sparkles className="h-3.5 w-3.5" />
          生成新{title.replace('差分', '')}
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {sprites.map(sprite => (
          <div key={sprite.id} className="group relative flex-shrink-0">
            <div className={cn('w-28 h-40 rounded-xl bg-gradient-to-b border flex items-center justify-center overflow-hidden', c.gradient, c.border)}>
              {sprite.url ? (
                <img src={sprite.url} alt={sprite.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className={cn('h-10 w-10', `text-${color}-200`)} />
              )}
              {sprite.frameType && (
                <span className={cn('absolute top-1 left-1 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm', c.text)}>
                  {sprite.frameType === 'full' ? '全身' : sprite.frameType === 'half' ? '半身' : '齐胸'}
                </span>
              )}
            </div>
            <div className="mt-2 text-center">
              <span className="text-sm font-medium text-foreground">{sprite.name}</span>
              {color === 'blue' && (
                <select
                  value={sprite.frameType || 'half'}
                  onChange={(e) => onUpdate(sprite.id, { frameType: e.target.value as 'full' | 'half' | 'bust' })}
                  className="mt-1 block w-full rounded border border-border bg-white px-1 py-0.5 text-[10px] text-muted-foreground focus:border-pink-300 focus:outline-none"
                >
                  <option value="full">全身</option>
                  <option value="half">半身</option>
                  <option value="bust">齐胸</option>
                </select>
              )}
            </div>
            <button
              onClick={() => onDelete(sprite.id)}
              className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {sprites.length === 0 && (
          <div className="w-full py-8 text-center text-muted-foreground text-sm">
            暂无{title}，点击「生成新{title.replace('差分', '')}」创建
          </div>
        )}
      </div>
    </div>
  )
}
