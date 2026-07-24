'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Mic, Play, Volume2, Users, Library, Search, Info, Loader2, Globe, StopCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useProject } from '@/app/editor/_components/project-provider'
import { useProjectStore } from '@/lib/state/project-store-zustand'
import type { VoiceProfile, Character } from '@/app/editor/_lib/types'

// ── 性别标签 ──
const GENDER_LABELS: Record<string, { label: string; class: string }> = {
  female: { label: '女', class: 'bg-pink-100 text-pink-700' },
  male: { label: '男', class: 'bg-blue-100 text-blue-700' },
  child: { label: '童', class: 'bg-amber-100 text-amber-700' },
}

// ── 语言选项 ──
const LANG_OPTIONS = [
  { value: 'zh', label: '中文', flag: '🇨🇳' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
]

// ── 情绪选项 ──
const EMOTION_OPTIONS = [
  { value: 'normal', label: '默认', emoji: '😐' },
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'sad', label: '悲伤', emoji: '😢' },
  { value: 'angry', label: '愤怒', emoji: '😠' },
  { value: 'surprised', label: '惊讶', emoji: '😲' },
  { value: 'shy', label: '害羞', emoji: '🥰' },
]

export default function VoicePage() {
  const { project, projectId } = useProject()
  const characters = useProjectStore(s => s.characters)

  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChar, setSelectedChar] = useState<string | null>(null)
  const [showSelector, setShowSelector] = useState(false)

  // 试听状态
  const [previewProfileId, setPreviewProfileId] = useState<string | null>(null)
  const [previewText, setPreviewText] = useState('')
  const [previewLang, setPreviewLang] = useState('zh')
  const [previewEmotion, setPreviewEmotion] = useState('normal')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 选择器自动滚动到已选声形
  const selectorListRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showSelector || !selectedChar || !selectorListRef.current) return
    const currentChar = characters.find(c => c.id === selectedChar)
    if (!currentChar?.voiceProfileId) return
    // 等待 DOM 渲染后滚动到已选项
    requestAnimationFrame(() => {
      const el = selectorListRef.current?.querySelector(`[data-profile-id="${currentChar.voiceProfileId}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'auto' })
      }
    })
  }, [showSelector, selectedChar, characters])

  // 角色卡片滚动
  const charScrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [needsScroll, setNeedsScroll] = useState(false)

  const updateScrollArrows = useCallback(() => {
    const el = charScrollRef.current
    if (!el) return
    const overflow = el.scrollWidth > el.clientWidth + 4
    setNeedsScroll(overflow)
    if (overflow) {
      setCanScrollLeft(el.scrollLeft > 0)
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
  }, [])

  useEffect(() => {
    const el = charScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(updateScrollArrows)
    ro.observe(el)
    // 等 DOM 渲染完成后再检测
    // 多次检测确保布局完成后正确判断
    requestAnimationFrame(() => {
      updateScrollArrows()
      setTimeout(() => updateScrollArrows(), 100)
    })
    return () => ro.disconnect()
  }, [updateScrollArrows, characters])

  const scrollChars = (direction: 'left' | 'right') => {
    const el = charScrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  // 筛选条件
  const [filterGender, setFilterGender] = useState('')
  const [filterAge, setFilterAge] = useState('')
  const [filterStyle, setFilterStyle] = useState('')
  const [filterTone, setFilterTone] = useState('')

  // ── 加载声形数据 ──
  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/voice/profiles?projectId=${projectId}`)
      const json = await res.json()
      if (json.success) {
        setProfiles(json.data.map((p: any) => ({
          id: p.id,
          projectId: p.projectId || p.project_id,
          name: p.name,
          gender: p.gender,
          age: p.age,
          voiceStyle: p.voiceStyle || p.voice_style,
          tone: p.tone,
          ttsSpeakerId: p.ttsSpeakerId || p.tts_speaker_id,
          description: p.description || '',
          createdAt: p.createdAt || p.created_at || 0,
          updatedAt: p.updatedAt || p.updated_at || 0,
        })))
      }
    } catch (e) {
      console.error('加载声形失败:', e)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { loadProfiles() }, [loadProfiles])

  // ── 筛选后的声形 ──
  const filteredProfiles = profiles.filter(p => {
    if (filterGender && p.gender !== filterGender) return false
    if (filterAge && p.age !== filterAge) return false
    if (filterStyle && p.voiceStyle !== filterStyle) return false
    if (filterTone && p.tone !== filterTone) return false
    return true
  })

  // ── 获取角色绑定的声形 ──
  const getBoundProfile = (char: Character): VoiceProfile | undefined => {
    if (!char.voiceProfileId) return undefined
    return profiles.find(p => p.id === char.voiceProfileId)
  }

  // ── 绑定声形到角色 ──
  const handleBindVoice = (charId: string, profileId: string) => {
    const updated = characters.map(c =>
      c.id === charId ? { ...c, voiceProfileId: profileId } : c
    )
    useProjectStore.getState().saveCharacters(updated)
    setShowSelector(false)
  }

  // ── 打开试听面板 ──
  const openPreview = (profileId: string) => {
    // 如果正在播放，先停止
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
    setPreviewProfileId(profileId)
    // 默认试听文本根据语言自适应
    const defaultTexts: Record<string, string> = {
      zh: '你好，欢迎来到我的世界。今天天气真好，一起去散步吧。',
      ja: 'こんにちは、私の世界へようこそ。今日はいい天気ですね。',
      en: 'Hello, welcome to my world. The weather is nice today. Let\'s go for a walk.',
    }
    setPreviewText(defaultTexts[previewLang] || defaultTexts.zh)
  }

  // ── 关闭试听面板 ──
  const closePreview = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
    setPreviewProfileId(null)
  }

  // ── 试听合成 ──
  const handlePreview = async () => {
    if (!previewProfileId || !previewText.trim()) return

    // 如果正在播放，停止
    if (isPlaying) {
      audioRef.current?.pause()
      audioRef.current = null
      setIsPlaying(false)
      return
    }

    setIsLoadingAudio(true)
    try {
      const res = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: previewText,
          voiceProfileId: previewProfileId,
          emotion: previewEmotion,
          speed: 'normal',
          volume: 50,
          language: previewLang,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error('试听失败:', err)
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }

      audio.onerror = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }

      await audio.play()
      setIsPlaying(true)
    } catch (e) {
      console.error('试听失败:', e)
    } finally {
      setIsLoadingAudio(false)
    }
  }

  // 语言切换时更新默认文本
  const handleLangChange = (lang: string) => {
    setPreviewLang(lang)
    const defaultTexts: Record<string, string> = {
      zh: '你好，欢迎来到我的世界。今天天气真好，一起去散步吧。',
      ja: 'こんにちは、私の世界へようこそ。今日はいい天気ですね。',
      en: 'Hello, welcome to my world. The weather is nice today. Let\'s go for a walk.',
    }
    setPreviewText(defaultTexts[lang] || defaultTexts.zh)
  }

  if (!project) return null

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 space-y-6">

        {/* ─── 页面标题 ─── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              语音设置
            </h1>
            <p className="text-sm text-muted-foreground mt-1">为角色绑定声形，支持中日英三语试听</p>
          </div>
          <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-md border border-border">
            {profiles.length} 种预设声形 · {characters.length} 个角色
          </div>
        </div>

        {/* ─── 一、角色声形绑定区 ─── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              角色声形绑定
            </h2>
            {needsScroll && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => scrollChars('left')}
                disabled={!canScrollLeft}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollChars('right')}
                disabled={!canScrollRight}
                className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            )}
          </div>
          <div
            ref={charScrollRef}
            onScroll={updateScrollArrows}
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-1"
          >
            {characters.map(char => {
              const bound = getBoundProfile(char)
              const isSkipped = char.isProtagonist || char.name === '旁白'
              return (
                <div key={char.id} className="rounded-lg bg-muted/30 border border-border p-4 flex flex-col flex-[0_0_calc((100%-48px)/4)] min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: char.color }}
                    >
                      {char.avatar ? (
                        <img src={char.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        char.name[0]
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{char.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {isSkipped ? '不配音' : (bound?.name || '未绑定声形')}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                  {isSkipped ? (
                    <div className="bg-muted/50 rounded-md px-3 py-2 text-center">
                      <span className="text-xs text-muted-foreground">🎭 {char.name === '旁白' ? '旁白' : '男主'}不配音</span>
                    </div>
                  ) : bound ? (
                    <div className="bg-card rounded-md border border-border px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{bound.name}</div>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${GENDER_LABELS[bound.gender]?.class || 'bg-gray-100 text-gray-700'}`}>
                              {GENDER_LABELS[bound.gender]?.label || bound.gender}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{bound.age}</span>
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{bound.voiceStyle}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openPreview(bound.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors bg-muted hover:bg-muted-foreground/20"
                          title="试听"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-md border border-dashed border-border px-3 py-2 text-center">
                      <span className="text-xs text-muted-foreground">未绑定声形</span>
                    </div>
                  )}
                  </div>

                  {!isSkipped && (
                    <button
                      onClick={() => { setSelectedChar(char.id); setShowSelector(true) }}
                      className="mt-auto w-full text-xs text-primary font-medium py-1.5 rounded-md border border-primary/30 hover:bg-primary/5 transition-colors"
                    >
                      {bound ? '更换声形' : '绑定声形'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── 二、声形库浏览区 ─── */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Library className="w-4 h-4 text-primary" />
              声形库
            </h2>
            <span className="text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-md border border-border">
              20 种预设声形
            </span>
          </div>

          {/* 筛选栏 */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="bg-muted border-none rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">全部性别</option>
              <option value="female">女</option>
              <option value="male">男</option>
              <option value="child">童声</option>
            </select>
            <select
              value={filterAge}
              onChange={e => setFilterAge(e.target.value)}
              className="bg-muted border-none rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">全部年龄段</option>
              <option value="幼年少女/少年">幼年少女/少年</option>
              <option value="青年">青年</option>
              <option value="成年">成年</option>
              <option value="成熟">成熟</option>
            </select>
            <select
              value={filterStyle}
              onChange={e => setFilterStyle(e.target.value)}
              className="bg-muted border-none rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">全部音色</option>
              <option value="温柔">温柔</option>
              <option value="元气">元气</option>
              <option value="天然">天然</option>
              <option value="高冷">高冷</option>
              <option value="傲娇">傲娇</option>
              <option value="成熟">成熟</option>
              <option value="神秘">神秘</option>
              <option value="病娇">病娇</option>
              <option value="阳光">阳光</option>
              <option value="冷淡">冷淡</option>
              <option value="热血">热血</option>
              <option value="腹黑">腹黑</option>
            </select>
            <select
              value={filterTone}
              onChange={e => setFilterTone(e.target.value)}
              className="bg-muted border-none rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">全部质感</option>
              <option value="甜美">甜美</option>
              <option value="自然">自然</option>
              <option value="低沉">低沉</option>
            </select>
            <button
              onClick={() => { setFilterGender(''); setFilterAge(''); setFilterStyle(''); setFilterTone('') }}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 transition-colors"
            >
              重置
            </button>
          </div>

          {/* 声形卡片网格 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">没有匹配的声形</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProfiles.map(profile => (
                <div key={profile.id} className="rounded-lg bg-muted/20 border border-border hover:shadow-md transition-shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-foreground truncate">{profile.name}</h3>
                  </div>
                  <div className="flex gap-1 mb-3 flex-wrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${GENDER_LABELS[profile.gender]?.class || 'bg-gray-100 text-gray-700'}`}>
                      {GENDER_LABELS[profile.gender]?.label || profile.gender}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.age}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.voiceStyle}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.tone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Info className="w-3 h-3 shrink-0" />
                    <span className="truncate">{profile.description}</span>
                  </div>
                  <button
                    onClick={() => openPreview(profile.id)}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md transition-colors bg-muted hover:bg-muted-foreground/20 text-foreground"
                  >
                    <Play className="w-3.5 h-3.5" />
                    试听
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ════════════════════════════════════ */}
      {/* 声形选择器弹窗 */}
      {/* ════════════════════════════════════ */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowSelector(false)}>
          <div className="bg-card rounded-xl shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">选择声形</h3>
              <button onClick={() => setShowSelector(false)} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div ref={selectorListRef} className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
              {profiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">暂无可用声形</div>
              )}
              {profiles.map(profile => {
                const currentChar = characters.find(c => c.id === selectedChar)
                const isSelected = currentChar?.voiceProfileId === profile.id
                return (
                <div
                  key={profile.id}
                  data-profile-id={profile.id}
                  onClick={() => handleBindVoice(selectedChar!, profile.id)}
                  className={`rounded-lg border-2 p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 bg-card'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{profile.name}</div>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${GENDER_LABELS[profile.gender]?.class || 'bg-gray-100 text-gray-700'}`}>
                        {GENDER_LABELS[profile.gender]?.label || profile.gender}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.age}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.voiceStyle}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{profile.tone}</span>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
            <div className="flex items-center justify-end px-6 py-4 border-t border-border">
              <button onClick={() => setShowSelector(false)} className="text-sm text-muted-foreground font-medium px-4 py-2 rounded-md hover:bg-muted transition-colors">
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/* 试听面板 */}
      {/* ════════════════════════════════════ */}
      {previewProfileId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closePreview}>
          <div className="bg-card rounded-xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-primary" />
                {profiles.find(p => p.id === previewProfileId)?.name || '声形'} — 试听
              </h3>
              <button onClick={closePreview} className="w-8 h-8 rounded-md hover:bg-muted flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* 语言选择 */}
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1.5">
                  {LANG_OPTIONS.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => handleLangChange(lang.value)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        previewLang === lang.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                      }`}
                    >
                      {lang.flag} {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 情绪选择 */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">情感：</span>
                <div className="flex gap-1 flex-wrap">
                  {EMOTION_OPTIONS.map(em => (
                    <button
                      key={em.value}
                      onClick={() => setPreviewEmotion(em.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        previewEmotion === em.value
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                      }`}
                    >
                      {em.emoji} {em.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 文本输入 */}
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  试听文本
                </label>
                <textarea
                  value={previewText}
                  onChange={e => setPreviewText(e.target.value)}
                  className="w-full bg-muted border-none rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 min-h-[80px] resize-none"
                  placeholder="输入要试听的文本..."
                  rows={3}
                />
              </div>

              {/* 播放按钮 */}
              <button
                onClick={handlePreview}
                disabled={isLoadingAudio || !previewText.trim()}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isPlaying
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:opacity-90 text-primary-foreground'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    合成中...
                  </>
                ) : isPlaying ? (
                  <>
                    <StopCircle className="w-4 h-4" />
                    停止播放
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    播放试听
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
