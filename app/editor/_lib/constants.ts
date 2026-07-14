import { FileText, BookOpen, Users, Image } from 'lucide-react'

// Tabs
export const tabs = [
  { id: 'outline', label: '大纲', icon: FileText },
  { id: 'chapter', label: '章节', icon: BookOpen },
  { id: 'characters', label: '角色', icon: Users },
  { id: 'asset', label: '素材', icon: Image },
]

// Route labels
export const routeLabels: Record<string, { label: string; color: string }> = {
  common: { label: '共通线', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  a: { label: 'A线', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  b: { label: 'B线', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  c: { label: 'C线', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  true: { label: 'True', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

// Ending labels
export const endingLabels: Record<string, { label: string; color: string; emoji: string }> = {
  GE: { label: 'Good End', color: 'bg-pink-100 text-pink-700 border-pink-200', emoji: '🌸' },
  NE: { label: 'Normal End', color: 'bg-blue-100 text-blue-700 border-blue-200', emoji: '🌿' },
  BE: { label: 'Bad End', color: 'bg-red-100 text-red-700 border-red-200', emoji: '💀' },
  TE: { label: 'True End', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', emoji: '⭐' },
}

// Asset category config
import type { AssetCategory } from '@/app/editor/_lib/types'
import { ImageIcon, Eye, Music2, Volume2, Mic } from 'lucide-react'

export const assetCategories: { id: AssetCategory; label: string; icon: typeof Image; color: string; description: string }[] = [
  { id: 'background', label: '背景', icon: ImageIcon, color: 'emerald', description: '场景背景图，每个场景一张' },
  { id: 'cg', label: 'CG', icon: Eye, color: 'amber', description: '特殊事件插画，关键剧情触发' },
  { id: 'bgm', label: 'BGM', icon: Music2, color: 'blue', description: '背景音乐，烘托氛围情绪' },
  { id: 'se', label: '音效', icon: Volume2, color: 'green', description: '环境音效与交互音效' },
  { id: 'voice', label: '语音', icon: Mic, color: 'violet', description: '角色语音台词' },
]

// Color mapping for category badges
export const colorMap: Record<string, { bg: string; text: string; border: string; light: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-100', gradient: 'from-emerald-400 to-teal-400' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-100', gradient: 'from-amber-400 to-orange-400' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-100', gradient: 'from-blue-400 to-cyan-400' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-100', gradient: 'from-green-400 to-emerald-400' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-100', gradient: 'from-violet-400 to-purple-400' },
}

// Placeholder gradient backgrounds for different asset types
export const placeholderGradients: Record<string, string> = {
  background: 'from-emerald-100 via-teal-50 to-cyan-100',
  cg: 'from-amber-100 via-orange-50 to-rose-100',
  bgm: 'from-blue-100 via-indigo-50 to-violet-100',
  se: 'from-green-100 via-emerald-50 to-teal-100',
  voice: 'from-violet-100 via-purple-50 to-fuchsia-100',
}
