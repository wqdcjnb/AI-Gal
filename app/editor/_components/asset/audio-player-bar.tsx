'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, X, Music2, Volume2, Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssetItem } from '@/app/editor/_lib/types'

function formatTime(s: number): string {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function AudioPlayerBar({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [dragging, setDragging] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !asset.url) return
    audio.src = asset.url
    audio.load()
    audio.play().catch(() => {})
    return () => { audio.pause(); audio.src = '' }
  }, [asset.url])

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().catch(() => {}); setPlaying(true) }
  }, [playing])

  const getRatio = (e: React.MouseEvent) => {
    if (!barRef.current) return 0
    const rect = barRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  }

  const seekTo = (ratio: number) => {
    if (!audioRef.current || !duration) return
    audioRef.current.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  const handleSeek = (e: React.MouseEvent) => {
    e.stopPropagation()
    seekTo(getRatio(e))
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setDragging(true)
    seekTo(getRatio(e))

    const onMove = (ev: MouseEvent) => seekTo(getRatio(ev as any))
    const onUp = () => { setDragging(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const categoryIcon = asset.category === 'bgm' ? Music2 : asset.category === 'se' ? Volume2 : Mic
  const Icon = categoryIcon

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-white/95 backdrop-blur-xl border border-pink-100 rounded-xl shadow-lg shadow-pink-100/20 px-4 py-2.5 flex items-center gap-3">
        <audio ref={audioRef} onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
          onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
          onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} />

        <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{asset.name}</span>

        <button onClick={togglePlay}
          className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
            playing ? 'bg-pink-100 text-pink-500' : 'bg-muted text-muted-foreground hover:text-foreground')}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
        </button>

        <span className="text-[10px] text-muted-foreground font-mono w-8 text-right shrink-0">{formatTime(currentTime)}</span>

        <div ref={barRef} className="w-48 h-1.5 rounded-full bg-muted cursor-pointer relative overflow-hidden"
          onMouseDown={handleDragStart} onClick={handleSeek}>
          <div className={cn('absolute inset-y-0 left-0 rounded-full transition-all', dragging ? 'bg-pink-400' : 'bg-gradient-to-r from-pink-400 to-violet-400')}
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
          <div className={cn('absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-pink-500 shadow transition-opacity',
            (dragging || playing) ? 'opacity-100' : 'opacity-0')}
            style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
        </div>

        <span className="text-[10px] text-muted-foreground font-mono w-8 shrink-0">{formatTime(duration)}</span>

        <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
