'use client'

import { useState, useRef } from 'react'
import { X, Sparkles, Trash2 } from 'lucide-react'
import type { Character } from '@/app/editor/_lib/types'
import { TagSection } from './tag-section'
import { AvatarCropDialog } from './avatar-crop-dialog'

export function CharEditPanel({
  character, onSave, onClose, onDelete, onGenerate, generatedImages, pickGenerated, selectedVariant,
}: {
  character: Character
  onSave: (data: Partial<Character>) => void
  onClose: () => void
  onDelete?: () => void
  onGenerate?: () => void
  generatedImages: string[]
  pickGenerated: (v: string) => void
  selectedVariant?: string | null
}) {
  const [name, setName] = useState(character.name)
  const [appearance, setAppearance] = useState<string[]>(character.appearance || [])
  const [temperament, setTemperament] = useState<string[]>(character.temperament || [])
  const [extraDesc, setExtraDesc] = useState(character.extraDescription || '')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop state
  const [cropImage, setCropImage] = useState<string | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setCropImage(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCropConfirm = async (blob: Blob) => {
    setUploading(true)
    setCropImage(null)
    try {
      const fd = new FormData()
      fd.append('file', blob, 'avatar.png')
      fd.append('folder', 'characters')
      const res = await fetch('/api/upload/image', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) {
        onSave({ avatar: json.data.cdnUrl })
      }
    } catch {} finally {
      setUploading(false)
    }
  }

  const defaultAppearance = ['长发', '短发', '黑发', '金发', '蓝瞳', '红瞳', '高挑', '娇小', '校服', '便服', '发夹', '眼镜']
  const defaultTemperament = ['温柔', '高冷', '元气', '傲娇', '神秘', '可爱', '优雅', '帅气', '成熟', '天然']
  const [customAppearance, setCustomAppearance] = useState<string[]>([])
  const [customTemperament, setCustomTemperament] = useState<string[]>([])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-5 mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">编辑角色信息</h3>
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-pink-100 to-violet-100 px-2.5 py-1 text-xs text-pink-700 hover:from-pink-200">
              <Sparkles className="h-3 w-3" />AI 生成
            </button>
            {onDelete && (
              <button onClick={() => setShowDeleteConfirm(true)}
                className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" onClick={() => setShowDeleteConfirm(false)}>
            <div className="mx-4 w-full max-w-xs rounded-xl bg-white p-5 shadow-xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold">确认删除</h3>
              <p className="mt-1 text-xs text-muted-foreground">确定要删除这个角色吗？</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border py-1.5 text-xs">取消</button>
                <button onClick={() => { onDelete?.(); setShowDeleteConfirm(false); onClose() }} className="flex-1 rounded-lg bg-red-500 py-1.5 text-xs text-white">删除</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-violet-50 border border-pink-100">
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFileSelect} />
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-white text-2xl font-bold cursor-pointer hover:ring-2 ring-offset-2 ring-pink-300 transition-all overflow-hidden"
              style={{ backgroundColor: character.color }}
              onClick={() => fileInputRef.current?.click()}>
              {character.avatar ? <img src={character.avatar} alt="" className="h-full w-full object-cover" /> : character.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{uploading ? '上传中...' : '上传头像'}</p>
              <p className="text-[10px] text-muted-foreground">点击头像选择图片，支持裁剪缩放</p>
            </div>
          </div>

          {/* Crop Dialog */}
          {cropImage && (
            <AvatarCropDialog imageSrc={cropImage} onConfirm={handleCropConfirm} onCancel={() => setCropImage(null)} />
          )}

          {/* Generated images strip */}
          {generatedImages.length > 0 && (
            <div className="flex gap-2">
              {generatedImages.map(v => (
                <button key={v} onClick={() => pickGenerated(v)}
                  className={`flex-1 aspect-[9/16] rounded-lg border-2 bg-gradient-to-b from-pink-50 to-violet-50 flex items-center justify-center transition-all hover:shadow-sm relative overflow-hidden ${selectedVariant === v ? 'border-emerald-400 shadow-md shadow-emerald-200' : 'border-amber-200 hover:border-amber-400'}`}>
                  <div className="flex h-full w-full items-center justify-center text-white text-4xl font-bold rounded-lg" style={{ backgroundColor: character.color }}>
                    {character.name[0]}
                  </div>
                  {selectedVariant === v && (
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold shadow-lg">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">角色名称</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          {/* AI Generation Params */}
          <div className="p-3 rounded-lg border bg-muted/30 space-y-3">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">AI 生成参数</p>
            <TagSection label="外貌" tags={appearance} allTags={defaultAppearance} setTags={setAppearance} customTags={customAppearance} setCustomTags={setCustomAppearance} />
            <TagSection label="气质" tags={temperament} allTags={defaultTemperament} setTags={setTemperament} customTags={customTemperament} setCustomTags={setCustomTemperament} />
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">补充描述</label>
              <textarea value={extraDesc} onChange={e => setExtraDesc(e.target.value)} rows={2}
                placeholder="如：银色长发，白色校服，蓝色蝴蝶发夹..."
                className="w-full rounded-lg border px-3 py-2 text-sm resize-none" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm">取消</button>
          <button onClick={() => onSave({ name: name.trim() || character.name, appearance, temperament, extraDescription: extraDesc })}
            className="flex-1 rounded-lg bg-gradient-to-r from-pink-500 to-violet-500 py-2 text-sm text-white font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}
