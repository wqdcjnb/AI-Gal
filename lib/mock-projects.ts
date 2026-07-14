// Mock data for AI-Gal project dashboard
// Will be replaced with Supabase queries later

export interface GameProject {
  id: string;
  name: string;
  style: string;
  setting: string;
  structure: string;
  synopsis: string;
  cover_url: string | null;
  chapter_count: number;
  status: 'editing' | 'complete';
  created_at: string;
  updated_at: string;
  // Computed fields
  chapterCount?: number;
  sceneCount?: number;
  characterCount?: number;
}

export const STYLE_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  '萌系': { label: '萌系', icon: '🌸', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30', desc: '轻松日常、角色卖萌、温馨治愈' },
  '泣系': { label: '泣系', icon: '💧', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', desc: '感人至深、生离死别、先虐后愈' },
  '郁系': { label: '郁系', icon: '🌧️', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', desc: '灰暗压抑、沉重无力、悲剧走向' },
  '燃系': { label: '燃系', icon: '🔥', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', desc: '热血战斗、史诗感、信念对决' },
  '恋爱喜剧': { label: '恋爱喜剧', icon: '💕', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', desc: '恋爱+搞笑、轻松诙谐、修罗场' },
  '纯爱': { label: '纯爱', icon: '❤️', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30', desc: '真挚专一的爱情、情感细腻' },
  '剧情向': { label: '剧情向', icon: '📖', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', desc: '宏大叙事、深刻主题、反转震撼' },
  '悬疑推理': { label: '悬疑推理', icon: '🔍', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', desc: '推理解谜、真相揭露、烧脑' },
  '恐怖猎奇': { label: '恐怖猎奇', icon: '👁️', color: 'bg-red-500/20 text-red-300 border-red-500/30', desc: '恐惧不安、心理惊悚、血腥' },
  '电波系': { label: '电波系', icon: '📡', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', desc: '独特世界观、意识流、实验性' },
};

export const SETTING_LABELS: Record<string, { label: string; icon: string; color: string; desc: string }> = {
  '校园': { label: '校园', icon: '🏫', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30', desc: '学校为舞台，教室、社团、学园祭' },
  '都市': { label: '都市', icon: '🌆', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', desc: '现代城市生活，公寓、咖啡厅、街道' },
  '奇幻': { label: '奇幻', icon: '🧙', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', desc: '魔法、异世界、中世纪' },
  '科幻': { label: '科幻', icon: '🚀', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', desc: '未来科技、太空、赛博朋克' },
  '和风': { label: '和风', icon: '⛩️', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', desc: '日本古代、妖怪、神社' },
  '末日': { label: '末日', icon: '🌍', color: 'bg-stone-500/20 text-stone-300 border-stone-500/30', desc: '后启示录、废墟世界、避难所' },
  '蒸汽朋克': { label: '蒸汽朋克', icon: '⚙️', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', desc: '蒸汽机械、维多利亚时代' },
  '异世界': { label: '异世界', icon: '✨', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', desc: '穿越/转生到平行世界' },
};

export const STRUCTURE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  '分支叙事': { label: '分支', icon: '⑂', desc: '共通线+个人线，选择决定路线' },
  '多结局': { label: '多结局', icon: '⑃', desc: '多个BE/NE/GE/TE' },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  editing: { label: '编辑中', color: 'bg-pink-500/20 text-pink-400' },
  complete: { label: '已完成', color: 'bg-emerald-500/20 text-emerald-400' },
};

// Mock projects for UI preview
export const mockProjects: GameProject[] = [
  {
    id: '1',
    name: '星光学园物语',
    style: '恋爱喜剧',
    setting: '校园',
    structure: '分支叙事',
    synopsis: '转学生来到充满秘密的星光学园，与五位性格各异的少女相遇，在学园祭的舞台上展开一段欢笑与感动交织的青春故事。',
    cover_url: null,
    chapter_count: 8,
    status: 'editing',
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-08T15:30:00Z',
    chapterCount: 8,
    sceneCount: 24,
    characterCount: 5,
  },
  {
    id: '2',
    name: '永夜协奏曲',
    style: '泣系',
    setting: '都市',
    structure: '多结局',
    synopsis: '在永不停止的雨城中，失去记忆的少年与神秘少女相遇。随着记忆的碎片逐渐拼凑，等待他们的是跨越生死的抉择。',
    cover_url: null,
    chapter_count: 12,
    status: 'editing',
    created_at: '2025-06-25T08:00:00Z',
    updated_at: '2025-07-07T20:15:00Z',
    chapterCount: 12,
    sceneCount: 36,
    characterCount: 4,
  },
  {
    id: '3',
    name: '樱花庄的魔法使',
    style: '萌系',
    setting: '奇幻',
    structure: '分支叙事',
    synopsis: '在魔法与日常共存的小镇上，见习魔法使与青梅竹马的轻松日常。温馨治愈的魔法喜剧故事。',
    cover_url: null,
    chapter_count: 5,
    status: 'editing',
    created_at: '2025-07-05T14:00:00Z',
    updated_at: '2025-07-05T14:00:00Z',
    chapterCount: 5,
    sceneCount: 0,
    characterCount: 3,
  },
  {
    id: '4',
    name: '铁壁防线',
    style: '燃系',
    setting: '末日',
    structure: '多结局',
    synopsis: '人类最后的防线都市中，少年兵与战术指挥少女并肩作战，在绝望中寻找希望的史诗战斗故事。',
    cover_url: null,
    chapter_count: 10,
    status: 'complete',
    created_at: '2025-06-15T09:00:00Z',
    updated_at: '2025-07-06T18:00:00Z',
    chapterCount: 10,
    sceneCount: 42,
    characterCount: 6,
  },
];
