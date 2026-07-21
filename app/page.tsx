'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'
import { Sparkles, ArrowRight, Heart, CloudRain, Eye } from 'lucide-react'

const styles = {
  moe: { label: '萌系', subtitle: '甜蜜日常，怦然心动', icon: Heart, color: 'from-pink-500 to-rose-400', glow: 'rgba(236,72,153,0.1)' },
  nakige: { label: '泣系', subtitle: '泪水尽头，是温暖的光', icon: CloudRain, color: 'from-sky-500 to-blue-400', glow: 'rgba(14,165,233,0.1)' },
  mystery: { label: '悬疑', subtitle: '真相，藏在选择的缝隙里', icon: Eye, color: 'from-violet-500 to-purple-400', glow: 'rgba(139,92,246,0.1)' },
}

export default function LandingPage() {
  const { user, openAuth } = useAuth()
  const router = useRouter()
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [showChoices, setShowChoices] = useState(false)

  useEffect(() => {
    const fullText = '你想创造一个，什么样的故事？'
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) { setTypedText(fullText.slice(0, index)); index++ }
      else { clearInterval(interval); setTimeout(() => setShowChoices(true), 500) }
    }, 120)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(interval)
  }, [])

  const handleStart = useCallback(() => {
    if (user) { router.push('/dashboard') } else { openAuth() }
  }, [user, router, openAuth])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/20 landing-twinkle"
            style={{ width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`, left: `${(i * 37 + 13) % 100}%`, top: `${(i * 53 + 7) % 100}%`, animationDelay: `${(i * 0.3) % 3}s` }} />
        ))}
      </div>

      <div className="relative z-10 mb-16">
        <p className="text-center text-2xl md:text-4xl font-light tracking-wider text-white/90">
          {typedText}
          <span className={cn('inline-block w-0.5 h-7 md:h-9 bg-white/80 ml-1 align-middle', showCursor ? 'opacity-100' : 'opacity-0')} />
        </p>
      </div>

      <div className={cn('relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 transition-all duration-700',
        showChoices ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
        {(Object.entries(styles) as [string, typeof styles.moe][]).map(([key, s]) => {
          const Icon = s.icon
          return (
            <button key={key} onClick={handleStart}
              className="group relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm transition-all duration-300 hover:border-white/30 hover:bg-white/10 hover:scale-105 min-w-[160px]">
              <Icon className="h-6 w-6 text-white/60 group-hover:text-white/90 transition-colors" />
              <span className="text-lg font-medium text-white/80 group-hover:text-white">{s.label}</span>
              <span className="text-xs text-white/40 group-hover:text-white/60">{s.subtitle}</span>
            </button>
          )
        })}
      </div>

      <div className={cn('absolute bottom-12 text-white/20 text-sm transition-all duration-700',
        showChoices ? 'opacity-100' : 'opacity-0')}>
        点击任意风格，开始你的故事
      </div>
    </div>
  )
}
