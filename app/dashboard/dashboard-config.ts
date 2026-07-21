export interface GameProject {
  id: string
  name: string
  style: string
  setting: string
  structure: string
  synopsis: string
  cover_url: string | null
  chapter_count: number
  status: 'editing' | 'complete'
  created_at: string
  updated_at: string
  chapterCount?: number
  sceneCount?: number
  characterCount?: number
}

export const STYLE_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  '萌系':     { label: '萌系',     icon: '🌸', color: 'bg-pink-200/60 text-pink-800 border-pink-300',     desc: '轻松日常、角色卖萌、温馨治愈' },
  '泣系':     { label: '泣系',     icon: '💧', color: 'bg-blue-200/60 text-blue-800 border-blue-300',       desc: '感人至深、生离死别、先虐后愈' },
  '郁系':     { label: '郁系',     icon: '🌑', color: 'bg-purple-200/60 text-purple-800 border-purple-300',   desc: '灰暗压抑、沉重无力、悲剧走向' },
  '燃系':     { label: '燃系',     icon: '🔥', color: 'bg-red-200/60 text-red-800 border-red-300',           desc: '热血战斗、史诗感、信念对决' },
  '恋爱喜剧': { label: '恋爱喜剧', icon: '💕', color: 'bg-rose-200/60 text-rose-800 border-rose-300',         desc: '恋爱+搞笑、轻松诙谐、修罗场' },
  '纯爱':     { label: '纯爱',     icon: '❤️', color: 'bg-red-100/60 text-red-700 border-red-200',            desc: '真挚专一的爱情、情感细腻' },
  '剧情向':   { label: '剧情向',   icon: '📖', color: 'bg-stone-200/60 text-stone-800 border-stone-300',       desc: '宏大叙事、深刻主题、反转震撼' },
  '悬疑推理': { label: '悬疑推理', icon: '🔍', color: 'bg-amber-200/60 text-amber-800 border-amber-300',       desc: '推理解谜、真相揭露、烧脑' },
  '恐怖猎奇': { label: '恐怖猎奇', icon: '👁', color: 'bg-slate-300/60 text-slate-800 border-slate-400',      desc: '恐惧不安、心理惊悚、血腥' },
  '电波系':   { label: '电波系',   icon: '📡', color: 'bg-cyan-200/60 text-cyan-800 border-cyan-300',         desc: '独特世界观、意识流、实验性' },
}

export const SETTING_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  '校园':     { label: '校园',     icon: '🏫', color: 'bg-emerald-100 text-emerald-700 border-emerald-200',   desc: '学校为舞台' },
  '都市':     { label: '都市',     icon: '🌆', color: 'bg-sky-100 text-sky-700 border-sky-200',               desc: '现代城市生活' },
  '奇幻':     { label: '奇幻',     icon: '🧙', color: 'bg-violet-100 text-violet-700 border-violet-200',       desc: '魔法、异世界、中世纪' },
  '科幻':     { label: '科幻',     icon: '🚀', color: 'bg-blue-100 text-blue-700 border-blue-200',             desc: '未来科技、太空、赛博朋克' },
  '和风':     { label: '和风',     icon: '⛩', color: 'bg-red-100 text-red-700 border-red-200',               desc: '日本古代、妖怪、神社' },
  '末日':     { label: '末日',     icon: '🌍', color: 'bg-gray-100 text-gray-700 border-gray-200',             desc: '后启示录、废墟世界' },
  '蒸汽朋克': { label: '蒸汽朋克', icon: '⚙️', color: 'bg-amber-100 text-amber-700 border-amber-200',         desc: '蒸汽机械、维多利亚时代' },
  '异世界':   { label: '异世界',   icon: '✨', color: 'bg-teal-100 text-teal-700 border-teal-200',             desc: '穿越/转生到平行世界' },
}

export const STRUCTURE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  '分支叙事': { label: '分支', icon: '⑂', desc: '共通线+个人线，选择决定路线' },
  '多结局':   { label: '多结局', icon: '⑃', desc: '多个BE/NE/GE/TE' },
}

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  editing:  { label: '编辑中', color: 'text-amber-600 bg-amber-50' },
  complete: { label: '已完成', color: 'text-emerald-600 bg-emerald-50' },
}

export const COVER_GRADIENTS = [
  'from-pink-200/60 via-rose-100/40 to-violet-200/60',
  'from-blue-200/60 via-indigo-100/40 to-purple-200/60',
  'from-amber-200/60 via-orange-100/40 to-rose-200/60',
  'from-emerald-200/60 via-teal-100/40 to-cyan-200/60',
  'from-violet-200/60 via-purple-100/40 to-fuchsia-200/60',
]

export const STYLE_ICONS: Record<string, string> = {
  '萌系': '🌸', '泣系': '💧', '郁系': '🌑', '燃系': '🔥',
  '恋爱喜剧': '💕', '纯爱': '❤️', '剧情向': '📖', '悬疑推理': '🔍',
  '恐怖猎奇': '👁', '电波系': '📡',
}

export function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`
  return date.toLocaleDateString('zh-CN')
}
