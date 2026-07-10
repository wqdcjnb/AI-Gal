'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  ArrowRight,
  FileText,
  BookOpen,
  Users,
  Image,
  Download,
  ChevronDown,
  Play,
  Heart,
  CloudRain,
  Eye,
  Zap,
  Layers,
  Music,
  Palette,
} from 'lucide-react'

// ==================== Types ====================
type StoryStyle = 'moe' | 'nakige' | 'mystery' | null
type Phase = 'opening' | 'choosing' | 'transition' | 'showcase'

interface StyleTheme {
  id: StoryStyle
  label: string
  subtitle: string
  icon: typeof Heart
  // Colors
  bg: string
  bgGradient: string
  text: string
  accent: string
  accentSecondary: string
  card: string
  cardBorder: string
  particle: string
  // Content
  tagline: string
  description: string
  features: { icon: typeof Sparkles; title: string; desc: string }[]
  sampleDialogue: { speaker: string; text: string; color: string }[]
}

// ==================== Style Definitions ====================
const styles: Record<NonNullable<StoryStyle>, StyleTheme> = {
  moe: {
    id: 'moe',
    label: '萌系',
    subtitle: '甜蜜日常，怦然心动',
    icon: Heart,
    bg: 'bg-gradient-to-b from-pink-50 via-rose-50/50 to-white',
    bgGradient: 'from-pink-200/40 via-rose-100/30 to-amber-50/20',
    text: 'text-rose-900',
    accent: 'text-pink-500',
    accentSecondary: 'text-rose-400',
    card: 'bg-white/80',
    cardBorder: 'border-pink-200/60',
    particle: 'bg-pink-300/60',
    tagline: '每一个微笑，都值得被记录',
    description: '阳光洒满的教室里，她转过身来，对你露出了那个熟悉的微笑。这样的日常，你想让它永远延续下去——那就把它变成一个故事吧。',
    features: [
      { icon: Heart, title: '甜蜜对话系统', desc: '轻松编写角色间的甜蜜互动，支持表情差分与语音' },
      { icon: Palette, title: '萌系美术风格', desc: 'AI 自动生成可爱的角色立绘和温暖的场景背景' },
      { icon: Music, title: '轻快 BGM', desc: '自动生成适合日常场景的轻快背景音乐' },
      { icon: Layers, title: '分支剧情', desc: '设计多条恋爱路线，每个选择都通向不同的结局' },
    ],
    sampleDialogue: [
      { speaker: '樱井 阳菜', text: '学长！今天的便当，我多做了一份哦...', color: '#ec4899' },
      { speaker: '旁白', text: '她的脸颊微微泛红，把便当盒递了过来。', color: '#9ca3af' },
      { speaker: '你', text: '（她的心意...我该怎么回应？）', color: '#6366f1' },
    ],
  },
  nakige: {
    id: 'nakige',
    label: '泣系',
    subtitle: '泪水尽头，是温暖的光',
    icon: CloudRain,
    bg: 'bg-gradient-to-b from-sky-50 via-blue-50/50 to-slate-50',
    bgGradient: 'from-sky-200/40 via-blue-100/30 to-indigo-50/20',
    text: 'text-sky-900',
    accent: 'text-sky-500',
    accentSecondary: 'text-blue-400',
    card: 'bg-white/80',
    cardBorder: 'border-sky-200/60',
    particle: 'bg-sky-300/60',
    tagline: '那些无法传达的思念，化作故事',
    description: '雨后的天空出现了彩虹，她站在你身旁，轻声说了一句「谢谢你」。你知道，有些相遇注定要离别——但正因如此，每一秒才更珍贵。',
    features: [
      { icon: CloudRain, title: '情感渲染引擎', desc: '通过文字速度、画面特效和BGM变化，渲染催泪场景' },
      { icon: Eye, title: 'CG 事件系统', desc: '关键剧情自动触发精美 CG，定格最动人的瞬间' },
      { icon: Music, title: '情感配乐', desc: 'AI 根据场景情感自动生成钢琴、弦乐等感人配乐' },
      { icon: Layers, title: '多结局叙事', desc: 'True End / Normal End / Bad End，每个结局都触动人心' },
    ],
    sampleDialogue: [
      { speaker: '月宫 雪', text: '如果...有一天我不在了，你会记住我吗？', color: '#0ea5e9' },
      { speaker: '旁白', text: '雨滴落在伞面上，发出细碎的声响。她的声音很轻，像是随时会被风带走。', color: '#9ca3af' },
      { speaker: '你', text: '「我怎么会忘记...你这个笨蛋。」', color: '#6366f1' },
    ],
  },
  mystery: {
    id: 'mystery',
    label: '悬疑',
    subtitle: '真相，藏在选择的缝隙里',
    icon: Eye,
    bg: 'bg-gradient-to-b from-violet-50 via-purple-50/50 to-slate-50',
    bgGradient: 'from-violet-200/40 via-purple-100/30 to-slate-100/20',
    text: 'text-violet-900',
    accent: 'text-violet-500',
    accentSecondary: 'text-purple-400',
    card: 'bg-white/80',
    cardBorder: 'border-violet-200/60',
    particle: 'bg-violet-300/60',
    tagline: '你看到的，未必是真相',
    description: '时钟指向了不存在的第十三小时。走廊尽头传来了熟悉的脚步声，但那个人明明已经...「你终于来了。我等了很久。」',
    features: [
      { icon: Eye, title: '碎片化叙事', desc: '非线性剧情编排，支持倒叙、插叙、多视角切换' },
      { icon: Zap, title: '画面特效', desc: '震动、闪白、glitch 等特效，营造紧张悬疑氛围' },
      { icon: Music, title: '氛围音效', desc: '环境音、心跳声、脚步声...用声音构建不安感' },
      { icon: Layers, title: '隐藏选择肢', desc: '满足特定条件才出现的秘密选项，通往隐藏的真相' },
    ],
    sampleDialogue: [
      { speaker: '???', text: '你不记得了吗？这里...你曾经来过。', color: '#8b5cf6' },
      { speaker: '旁白', text: '照片上的人脸被涂黑了。但那个笑容，莫名地熟悉。', color: '#9ca3af' },
      { speaker: '你', text: '（这张照片...为什么会在我的抽屉里？）', color: '#6366f1' },
    ],
  },
}

// ==================== Main Component ====================
export default function LandingPage() {
  const [phase, setPhase] = useState<Phase>('opening')
  const [selectedStyle, setSelectedStyle] = useState<StoryStyle>(null)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showChoices, setShowChoices] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Opening typewriter effect
  useEffect(() => {
    if (phase !== 'opening') return

    const fullText = '你想创造一个，什么样的故事？'
    let index = 0

    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => setShowChoices(true), 500)
        setPhase('choosing')
      }
    }, 120)

    return () => clearInterval(typeInterval)
  }, [phase])

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(interval)
  }, [])

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle style selection
  const handleStyleSelect = useCallback((style: StoryStyle) => {
    setSelectedStyle(style)
    setPhase('transition')
    setTimeout(() => {
      setPhase('showcase')
    }, 1200)
  }, [])

  const theme = selectedStyle ? styles[selectedStyle] : null

  return (
    <div ref={containerRef} className="min-h-screen">
      {/* ===== Phase: Opening & Choosing ===== */}
      {(phase === 'opening' || phase === 'choosing') && (
        <OpeningScene
          typedText={typedText}
          showCursor={showCursor}
          showChoices={showChoices}
          onStyleSelect={handleStyleSelect}
        />
      )}

      {/* ===== Phase: Transition ===== */}
      {phase === 'transition' && theme && (
        <TransitionScene theme={theme} />
      )}

      {/* ===== Phase: Showcase ===== */}
      {phase === 'showcase' && theme && (
        <ShowcaseScene
          theme={theme}
          scrollY={scrollY}
          onReset={() => {
            setPhase('opening')
            setSelectedStyle(null)
            setTypedText('')
            setShowChoices(false)
            window.scrollTo({ top: 0 })
          }}
        />
      )}
    </div>
  )
}

// ==================== Opening Scene ====================
function OpeningScene({
  typedText,
  showCursor,
  showChoices,
  onStyleSelect,
}: {
  typedText: string
  showCursor: boolean
  showChoices: boolean
  onStyleSelect: (style: StoryStyle) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      {/* Subtle starfield */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 landing-twinkle"
            style={{
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      {/* Typewriter text */}
      <div className="relative z-10 mb-16">
        <p className="text-center text-2xl md:text-4xl font-light tracking-wider text-white/90 md:leading-relaxed"
           style={{ fontFamily: '"PingFang SC", "Noto Sans SC", sans-serif' }}>
          {typedText}
          <span className={cn('inline-block w-0.5 h-7 md:h-9 bg-white/80 ml-1 align-middle transition-opacity duration-100', showCursor ? 'opacity-100' : 'opacity-0')} />
        </p>
      </div>

      {/* Style choices */}
      <div className={cn(
        'relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 transition-all duration-700',
        showChoices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}>
        {(Object.entries(styles) as [NonNullable<StoryStyle>, StyleTheme][]).map(([key, style]) => {
          const Icon = style.icon
          return (
            <button
              key={key}
              onClick={() => onStyleSelect(key)}
              className={cn(
                'group relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm',
                'transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-105',
                'min-w-[160px]'
              )}
            >
              <Icon className="h-6 w-6 text-white/60 group-hover:text-white/90 transition-colors" />
              <span className="text-lg font-medium text-white/80 group-hover:text-white transition-colors">
                {style.label}
              </span>
              <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">
                {style.subtitle}
              </span>
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: key === 'moe' ? 'radial-gradient(circle at center, rgba(236,72,153,0.1) 0%, transparent 70%)' :
                              key === 'nakige' ? 'radial-gradient(circle at center, rgba(14,165,233,0.1) 0%, transparent 70%)' :
                              'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%)'
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Bottom hint */}
      <div className={cn(
        'absolute bottom-12 text-white/20 text-sm transition-all duration-700',
        showChoices ? 'opacity-100' : 'opacity-0'
      )}>
        选择一个风格，开始你的故事
      </div>
    </div>
  )
}

// ==================== Transition Scene ====================
function TransitionScene({ theme }: { theme: StyleTheme }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className={cn('absolute inset-0 bg-gradient-to-b landing-fade-in', theme.bgGradient)} />
      <div className="relative z-10 text-center landing-scale-in">
        <p className={cn('text-3xl md:text-5xl font-light tracking-wider', theme.text)}>
          {theme.tagline}
        </p>
      </div>
    </div>
  )
}

// ==================== Showcase Scene ====================
function ShowcaseScene({
  theme,
  scrollY,
  onReset,
}: {
  theme: StyleTheme
  scrollY: number
  onReset: () => void
}) {
  return (
    <div className={cn('min-h-screen', theme.bg)}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn('absolute rounded-full', theme.particle)}
              style={{
                width: `${4 + (i % 4) * 2}px`,
                height: `${4 + (i % 4) * 2}px`,
                left: `${(i * 41 + 17) % 100}%`,
                top: `${(i * 59 + 11) % 100}%`,
                opacity: 0.3 + ((i * 23) % 40) / 100,
                transform: `translateY(${scrollY * (0.1 + (i % 3) * 0.05)}px)`,
              }}
            />
          ))}
          {/* Large gradient orb */}
          <div
            className={cn('absolute w-[600px] h-[600px] rounded-full opacity-20 blur-3xl')}
            style={{
              background: theme.id === 'moe' ? 'radial-gradient(circle, #ec4899 0%, transparent 70%)' :
                          theme.id === 'nakige' ? 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' :
                          'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              right: '-200px',
              top: '-100px',
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Style badge */}
          <div className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8',
            theme.cardBorder, theme.card, 'backdrop-blur-sm'
          )}>
            <theme.icon className={cn('h-4 w-4', theme.accent)} />
            <span className={cn('text-sm font-medium', theme.text)}>{theme.label} · {theme.subtitle}</span>
          </div>

          {/* Main headline */}
          <h1 className={cn('text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6', theme.text)}>
            <span className="block">你的故事</span>
            <span className={cn('bg-gradient-to-r bg-clip-text text-transparent',
              theme.id === 'moe' ? 'from-pink-500 to-rose-400' :
              theme.id === 'nakige' ? 'from-sky-500 to-blue-400' :
              'from-violet-500 to-purple-400'
            )}>
              AI 来绘制
            </span>
          </h1>

          {/* Description */}
          <p className={cn('text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed', theme.text, 'opacity-70')}>
            {theme.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105',
                theme.id === 'moe' ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-pink-200/50' :
                theme.id === 'nakige' ? 'bg-gradient-to-r from-sky-500 to-blue-400 shadow-sky-200/50' :
                'bg-gradient-to-r from-violet-500 to-purple-400 shadow-violet-200/50'
              )}
            >
              <Sparkles className="h-5 w-5" />
              开始创作
            </Link>
            <button
              onClick={onReset}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-6 py-3.5 text-base font-medium transition-all hover:scale-105',
                theme.cardBorder, theme.card, theme.text, 'backdrop-blur-sm'
              )}
            >
              <Play className="h-4 w-4" />
              重新选择风格
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className={cn('text-xs', theme.text, 'opacity-40')}>向下滚动</span>
          <ChevronDown className={cn('h-5 w-5', theme.text, 'opacity-40')} />
        </div>
      </section>

      {/* Sample Dialogue Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <SectionTitle theme={theme} title="故事预览" subtitle="看看 AI 为你编织的开场" />
          <div className={cn('rounded-2xl border p-6 md:p-8 backdrop-blur-sm', theme.card, theme.cardBorder)}>
            {/* VN-style dialogue box */}
            <div className="space-y-6">
              {theme.sampleDialogue.map((line, i) => (
                <div
                  key={i}
                  className="landing-fade-in-up"
                  style={{ animationDelay: `${i * 0.3}s`, animationFillMode: 'both' }}
                >
                  {line.speaker !== '旁白' && (
                    <span className={cn('text-sm font-medium mb-1 block')} style={{ color: line.color }}>
                      {line.speaker}
                    </span>
                  )}
                  <p className={cn(
                    'text-base md:text-lg leading-relaxed',
                    line.speaker === '旁白' ? 'italic opacity-60' : theme.text,
                  )}>
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
            {/* Choice preview */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className={cn('text-xs mb-3', theme.text, 'opacity-40')}>▼ 选择支</p>
              <div className="flex flex-col gap-2">
                {['接受她的心意', '委婉地拒绝'].map((choice, i) => (
                  <div
                    key={i}
                    className={cn(
                      'rounded-lg border px-4 py-2.5 text-sm transition-all hover:scale-[1.02] cursor-pointer',
                      theme.cardBorder,
                      theme.id === 'moe' ? 'hover:bg-pink-50 hover:border-pink-300' :
                      theme.id === 'nakige' ? 'hover:bg-sky-50 hover:border-sky-300' :
                      'hover:bg-violet-50 hover:border-violet-300'
                    )}
                  >
                    <span className={theme.text}>{choice}</span>
                    <ArrowRight className="h-3 w-3 inline-block ml-2 opacity-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <SectionTitle theme={theme} title="为这个故事量身定制的功能" subtitle="每个功能都为你的创作而生" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {theme.features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className={cn(
                    'group rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                    theme.card, theme.cardBorder
                  )}
                >
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors',
                    theme.id === 'moe' ? 'bg-pink-100 group-hover:bg-pink-200' :
                    theme.id === 'nakige' ? 'bg-sky-100 group-hover:bg-sky-200' :
                    'bg-violet-100 group-hover:bg-violet-200'
                  )}>
                    <Icon className={cn('h-5 w-5', theme.accent)} />
                  </div>
                  <h3 className={cn('text-lg font-semibold mb-2', theme.text)}>{feature.title}</h3>
                  <p className={cn('text-sm leading-relaxed', theme.text, 'opacity-60')}>{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <SectionTitle theme={theme} title="从灵感到成品" subtitle="四步完成你的 Galgame" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, step: '01', title: 'AI 生成大纲', desc: '输入灵感，AI 自动构建完整故事框架' },
              { icon: BookOpen, step: '02', title: '编辑章节剧情', desc: '对话、旁白、选择支，精细编排每个场景' },
              { icon: Image, step: '03', title: '生成素材', desc: '背景、立绘、CG、BGM，AI 一键生成' },
              { icon: Download, step: '04', title: '导出 Ren\'Py', desc: '打包导出，用 Ren\'Py 引擎运行你的游戏' },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div
                  key={i}
                  className={cn(
                    'relative rounded-2xl border p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                    theme.card, theme.cardBorder
                  )}
                >
                  <span className={cn(
                    'absolute top-3 right-4 text-3xl font-bold opacity-10',
                    theme.text
                  )}>{item.step}</span>
                  <Icon className={cn('h-6 w-6 mb-3', theme.accent)} />
                  <h4 className={cn('text-sm font-semibold mb-1', theme.text)}>{item.title}</h4>
                  <p className={cn('text-xs leading-relaxed', theme.text, 'opacity-50')}>{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className={cn('text-2xl md:text-3xl font-light mb-4', theme.text)}>
            每个伟大的故事
          </p>
          <p className={cn('text-2xl md:text-3xl font-bold mb-8', theme.text)}>
            都始于一句话
          </p>
          <Link
            href="/"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-10 py-4 text-lg font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-105',
              theme.id === 'moe' ? 'bg-gradient-to-r from-pink-500 to-rose-400 shadow-pink-200/50' :
              theme.id === 'nakige' ? 'bg-gradient-to-r from-sky-500 to-blue-400 shadow-sky-200/50' :
              'bg-gradient-to-r from-violet-500 to-purple-400 shadow-violet-200/50'
            )}
          >
            <Sparkles className="h-5 w-5" />
            写下你的第一句话
          </Link>
          <div className="mt-6">
            <button
              onClick={onReset}
              className={cn('text-sm underline underline-offset-4 transition-colors hover:opacity-70', theme.text, 'opacity-40')}
            >
              或者，换一个风格试试？
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={cn('border-t py-8 px-6 text-center', theme.cardBorder)}>
        <p className={cn('text-sm', theme.text, 'opacity-30')}>
          AI-Gal — AI 驱动的 Galgame 自动生成平台
        </p>
      </footer>
    </div>
  )
}

// ==================== Shared Components ====================
function SectionTitle({ theme, title, subtitle }: { theme: StyleTheme; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <h2 className={cn('text-2xl md:text-3xl font-bold mb-3', theme.text)}>{title}</h2>
      <p className={cn('text-sm md:text-base', theme.text, 'opacity-50')}>{subtitle}</p>
    </div>
  )
}
