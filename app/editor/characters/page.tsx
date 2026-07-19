'use client'

import { useState, useEffect } from 'react'
import { Plus, Loader2, Sparkles, Users, ImageIcon, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/app/editor/_components/project-provider'
import { useProjectStore } from '@/lib/project-store-zustand'
import type { Character, Sprite, SavedCombo } from '@/app/editor/_lib/types'
import { SimpleSelect, SpriteSelect } from '@/app/editor/_components/characters/sprite-select'
import { ComboCard } from '@/app/editor/_components/characters/combo-card'
import { CharEditPanel } from '@/app/editor/_components/characters/char-edit-panel'

export type { SavedCombo }

export default function CharactersPage() {
  const { project } = useProject()
  const characters = useProjectStore(s => s.characters)
  const savedCombos = useProjectStore(s => s.savedCombos)
  const saveCharacters = useProjectStore(s => s.saveCharacters)
  const saveCombos = useProjectStore(s => s.saveCombos)
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null)

  // Editor state
  const [editSpriteId, setEditSpriteId] = useState('')
  const [editExpressionId, setEditExpressionId] = useState('')
  const [editOutfitId, setEditOutfitId] = useState('')
  const [editPoseId, setEditPoseId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
  const [frameType, setFrameType] = useState<'full' | 'half' | 'bust'>('full')
  const [showEditPanel, setShowEditPanel] = useState(false)

  // 角色从缓存加载，不做 mock 初始化
  useEffect(() => {
    if (!project) return
  }, [project])

  useEffect(() => {
    if (!selectedCharId && characters.length > 0) setSelectedCharId(characters[0].id)
  }, [characters, selectedCharId])

  if (!project) return null

  const selectedChar = characters.find(c => c.id === selectedCharId)
  const charSprites = selectedChar?.sprites || []
  const baseSprites = charSprites.filter(s => s.type === 'base')
  const expressionSprites = charSprites.filter(s => s.type === 'expression')
  const outfitSprites = charSprites.filter(s => s.type === 'outfit')
  const poseSprites = charSprites.filter(s => s.type === 'pose')
  const combos = savedCombos[selectedCharId || ''] || []

  const addCharacter = () => {
    const newChar: Character = {
      id: `c${Date.now()}`, name: '新角色', color: '#6b7280', personality: '', description: '',
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

  const handleGenerate = () => {
    if (!selectedCharId) return
    setIsGenerating(true)
    setSelectedVariant(null)
    setTimeout(() => {
      setGeneratedImages(['var1', 'var2', 'var3', 'var4'])
      setIsGenerating(false)
    }, 2000)
  }

  const pickGenerated = (variant: string) => {
    if (!selectedCharId) return
    const existing = savedCombos[selectedCharId] || []
    let n = 1; while (existing.some(c => c.name === `角色立绘${n}`)) n++
    const name = `角色立绘${n}`
    const combo: SavedCombo = { id: `cmb-${Date.now()}`, spriteId: editSpriteId, expressionId: editExpressionId || undefined, outfitId: editOutfitId || undefined, poseId: editPoseId || undefined, name }
    const newCombos = { ...savedCombos, [selectedCharId]: [...existing, combo] }
    saveCombos(newCombos)
    saveCharacters(characters.map(ch => ch.id === selectedCharId ? { ...ch, avatar: combo.id } : ch))
    setSelectedVariant(variant)
  }

  const addSpriteOfType = (type: Sprite['type'], name: string) => {
    if (!selectedCharId || !name.trim()) return
    const newSprite: Sprite = { id: `s-${Date.now()}`, characterId: selectedCharId, name: name.trim(), type, url: '', tags: [] }
    const updatedChars = characters.map(ch => ch.id === selectedCharId ? { ...ch, sprites: [...ch.sprites, newSprite] } : ch)
    saveCharacters(updatedChars)
    if (type === 'base') setEditSpriteId(newSprite.id)
    else if (type === 'expression') setEditExpressionId(newSprite.id)
    else if (type === 'outfit') setEditOutfitId(newSprite.id)
    else if (type === 'pose') setEditPoseId(newSprite.id)
  }

  const deleteSprite = (spriteId: string) => {
    if (!selectedCharId) return
    if (editSpriteId === spriteId) setEditSpriteId('')
    if (editExpressionId === spriteId) setEditExpressionId('')
    if (editOutfitId === spriteId) setEditOutfitId('')
    if (editPoseId === spriteId) setEditPoseId('')
    const updatedChars = characters.map(ch => ch.id === selectedCharId ? { ...ch, sprites: ch.sprites.filter(s => s.id !== spriteId) } : ch)
    saveCharacters(updatedChars)
  }

  const deleteCombo = (comboId: string) => {
    if (!selectedCharId) return
    saveCombos({ ...savedCombos, [selectedCharId]: combos.filter(c => c.id !== comboId) })
  }

  const spriteName = (id?: string) => charSprites.find(s => s.id === id)?.name || ''

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Character Selector Bar */}
      <div className="flex-shrink-0 border-b border-border bg-card/50 px-4 py-3">
        <div className="flex items-center gap-3 overflow-x-auto">
          {characters.map(char => (
            <button key={char.id} onClick={() => setSelectedCharId(char.id)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap",
                selectedCharId === char.id ? "bg-pink-50 border border-pink-200 text-pink-700" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground")}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold overflow-hidden" style={{ backgroundColor: char.color }}>
                {char.avatar ? <img src={char.avatar} alt="" className="h-full w-full object-cover" /> : char.name[0]}
              </div>
              <span className="text-sm font-medium">{char.name}</span>
            </button>
          ))}
          <button onClick={addCharacter} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-pink-200 text-pink-500 hover:bg-pink-50/50 transition-all whitespace-nowrap">
            <Plus className="h-4 w-4" /><span className="text-sm">添加角色</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {selectedChar ? (
          <div className="max-w-5xl mx-auto">
            {/* Character Info Header */}
            <div className="flex items-center gap-4 mb-6 pb-4 border-b">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-xl font-bold overflow-hidden" style={{ backgroundColor: selectedChar.color }}>
                {selectedChar.avatar ? <img src={selectedChar.avatar} alt="" className="h-full w-full object-cover" /> : selectedChar.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{selectedChar.name}</h2>
                  <button onClick={() => setShowEditPanel(true)}
                    className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">对话颜色</span>
                <div className="flex items-center gap-1.5">
                  {['#ec4899', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                    <button key={c} onClick={() => saveCharacters(characters.map(ch => ch.id === selectedChar.id ? { ...ch, color: c } : ch))}
                      className={cn("h-6 w-6 rounded-full border-2 hover:scale-110 transition-transform", selectedChar.color === c ? 'border-foreground shadow-sm' : 'border-transparent')}
                      style={{ backgroundColor: c }} />
                  ))}
                  <div className="relative h-6 w-6 rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30 hover:border-pink-300 transition-colors cursor-pointer overflow-hidden"
                    style={{ backgroundColor: selectedChar.color }}>
                    <input type="color" value={selectedChar.color}
                      onChange={(e) => saveCharacters(characters.map(ch => ch.id === selectedChar.id ? { ...ch, color: e.target.value } : ch))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Panel */}
            {showEditPanel && selectedChar && (
              <CharEditPanel character={selectedChar}
                generatedImages={generatedImages} pickGenerated={pickGenerated}
                selectedVariant={selectedVariant}
                onSave={(data) => {
                  saveCharacters(characters.map(ch => ch.id === selectedChar.id ? { ...ch, ...data } : ch))
                  setShowEditPanel(false)
                  setGeneratedImages([])
                  setSelectedVariant(null)
                }}
                onGenerate={handleGenerate}
                onDelete={() => deleteCharacter(selectedChar.id)}
                onClose={() => { setShowEditPanel(false); setGeneratedImages([]); setSelectedVariant(null) }} />
            )}

            {/* Editor: Preview + Settings */}
            <div className="flex gap-6 mb-8">
              <div className="w-48 shrink-0">
                <div className="h-64 rounded-xl bg-gradient-to-b from-pink-50 to-violet-50 border border-pink-100 flex items-center justify-center overflow-hidden">
                  {editSpriteId ? (
                    <div className="flex h-full w-full items-center justify-center text-white text-6xl font-bold" style={{ backgroundColor: selectedChar.color }}>
                      {selectedChar.name[0]}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <span className="text-xs">选择基础立绘</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {spriteName(editSpriteId) && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">{spriteName(editSpriteId)}</span>}
                  {spriteName(editExpressionId) && <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] text-pink-700">{spriteName(editExpressionId)}</span>}
                  {spriteName(editOutfitId) && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">{spriteName(editOutfitId)}</span>}
                  {spriteName(editPoseId) && <span className="rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] text-cyan-700">{spriteName(editPoseId)}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <SimpleSelect label="基础立绘" options={baseSprites} value={editSpriteId} onChange={(v) => { setEditSpriteId(v); setEditExpressionId(''); setEditOutfitId(''); setEditPoseId('') }} />
                  <SpriteSelect label="表情" options={expressionSprites} value={editExpressionId} onChange={setEditExpressionId} type="expression" onAddSprite={addSpriteOfType} onDeleteSprite={deleteSprite} />
                  <SpriteSelect label="服装" options={outfitSprites} value={editOutfitId} onChange={setEditOutfitId} type="outfit" onAddSprite={addSpriteOfType} onDeleteSprite={deleteSprite} />
                  <SpriteSelect label="动作" options={poseSprites} value={editPoseId} onChange={setEditPoseId} type="pose" onAddSprite={addSpriteOfType} onDeleteSprite={deleteSprite} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">立绘类型</label>
                  <select className="w-full rounded-lg border px-3 py-2 text-sm" value={frameType} onChange={e => setFrameType(e.target.value as any)}>
                    <option value="full">全身</option>
                    <option value="half">半身</option>
                    <option value="bust">齐胸</option>
                  </select>
                </div>
                <button onClick={handleGenerate} disabled={isGenerating}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm text-white font-medium disabled:opacity-40">
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? 'AI 生成中...' : 'AI 生成'}
                </button>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-pink-500" />立绘画廊 ({combos.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {combos.map(combo => (
                  <ComboCard key={combo.id} combo={combo} selectedChar={selectedChar}
                    onEdit={() => {
                      setEditSpriteId(combo.spriteId)
                      setEditExpressionId(combo.expressionId || '')
                      setEditOutfitId(combo.outfitId || '')
                      setEditPoseId(combo.poseId || '')
                    }}
                    onDelete={() => deleteCombo(combo.id)}
                    onRename={(newName) => {
                      if (!selectedCharId) return
                      if (combos.some(c => c.id !== combo.id && c.name === newName)) return
                      saveCombos({ ...savedCombos, [selectedCharId]: combos.map(c => c.id === combo.id ? { ...c, name: newName } : c) })
                    }}
                    spriteName={spriteName} />
                ))}
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/30 aspect-[3/4] cursor-pointer hover:border-pink-400 hover:bg-pink-50/60 transition-colors">
                  <Plus className="h-8 w-8 text-pink-400" />
                  <span className="text-xs text-pink-500 font-medium">上传图片</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (!file || !selectedCharId) return
                      const reader = new FileReader()
                      reader.onload = () => {
                        const existing = savedCombos[selectedCharId] || []
                        let n = 1; while (existing.some(c => c.name === `角色立绘${n}`)) n++
                        const url = reader.result as string
                        const combo: SavedCombo = { id: `cmb-${Date.now()}`, spriteId: '', name: `角色立绘${n}`, url }
                        saveCombos({ ...savedCombos, [selectedCharId]: [...existing, combo] })
                      }
                      reader.readAsDataURL(file)
                    }} />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 mb-4">
              <Users className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">还没有角色</h3>
            <p className="text-sm text-muted-foreground mb-4">点击「添加角色」开始</p>
            <button onClick={addCharacter} className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-2 text-sm font-medium text-white">
              <Plus className="h-4 w-4" />添加角色
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
