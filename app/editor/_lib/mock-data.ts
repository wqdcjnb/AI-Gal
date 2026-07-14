import type { Sprite, Character, AssetItem } from '@/app/editor/_lib/types'

// Mock sprites
export const mockSprites: Sprite[] = [
  { id: 's1', characterId: 'c1', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's2', characterId: 'c1', name: '微笑', type: 'expression', url: '', tags: ['微笑', '开心'] },
  { id: 's3', characterId: 'c1', name: '惊讶', type: 'expression', url: '', tags: ['惊讶', '意外'] },
  { id: 's4', characterId: 'c1', name: '害羞', type: 'expression', url: '', tags: ['害羞', '脸红'] },
  { id: 's5', characterId: 'c2', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's6', characterId: 'c2', name: '微笑', type: 'expression', url: '', tags: ['微笑'] },
  { id: 's7', characterId: 'c3', name: '通常', type: 'base', url: '', tags: ['默认', '通常'] },
  { id: 's8', characterId: 'c3', name: '冷淡', type: 'expression', url: '', tags: ['冷淡', '无表情'] },
]

// Mock characters
export const mockCharacters: Character[] = [
  { id: 'c1', name: '桜', color: '#ec4899', sprites: mockSprites.filter(s => s.characterId === 'c1') },
  { id: 'c2', name: '主人公', color: '#3b82f6', sprites: mockSprites.filter(s => s.characterId === 'c2') },
  { id: 'c3', name: '雪乃', color: '#8b5cf6', sprites: mockSprites.filter(s => s.characterId === 'c3') },
]

// Mock asset data
export const mockAssets: AssetItem[] = [
  // Backgrounds
  { id: 'bg-1', name: '教室-白天', category: 'background', url: '', tags: ['教室', '学校', '白天'], usageCount: 5, usedIn: ['第一章', '第二章', '第三章'], status: 'generated', createdAt: '2小时前' },
  { id: 'bg-2', name: '教室-傍晚', category: 'background', url: '', tags: ['教室', '学校', '傍晚'], usageCount: 2, usedIn: ['第二章'], status: 'generated', createdAt: '2小时前' },
  { id: 'bg-3', name: '学校走廊', category: 'background', url: '', tags: ['走廊', '学校'], usageCount: 3, usedIn: ['第一章', '第三章'], status: 'generated', createdAt: '2小时前' },
  { id: 'bg-4', name: '天台', category: 'background', url: '', tags: ['天台', '学校', '屋顶'], usageCount: 4, usedIn: ['第一章', '第二章', '第四章'], status: 'generated', createdAt: '1小时前' },
  { id: 'bg-5', name: '樱花道', category: 'background', url: '', tags: ['樱花', '道路', '春天'], usageCount: 2, usedIn: ['第一章'], status: 'generated', createdAt: '1小时前' },
  { id: 'bg-6', name: '家庭餐厅', category: 'background', url: '', tags: ['餐厅', '室内'], usageCount: 1, usedIn: ['第三章'], status: 'placeholder', createdAt: '30分钟前' },
  { id: 'bg-7', name: '公园-夜晚', category: 'background', url: '', tags: ['公园', '夜晚'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前' },
  // CGs (Event CGs - full screen illustrations for key moments)
  { id: 'cg-1', name: '初遇-樱花树下', category: 'cg', url: '', tags: ['樱花', '相遇', '事件'], usageCount: 1, usedIn: ['第一章'], status: 'generated', createdAt: '1小时前', hasDiff: true, diffCount: 2, plotNode: '第一章-第1节', plotDescription: '男女主角在樱花树下的初次相遇' },
  { id: 'cg-2', name: '告白-天台夕阳', category: 'cg', url: '', tags: ['告白', '天台', '夕阳'], usageCount: 1, usedIn: ['第四章'], status: 'generated', createdAt: '1小时前', hasDiff: false, diffCount: 0, plotNode: '第四章-第3节', plotDescription: '天台夕阳下的告白场景' },
  { id: 'cg-3', name: '回忆-教室黄昏', category: 'cg', url: '', tags: ['回忆', '教室', '黄昏'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前', hasDiff: false, diffCount: 0, plotNode: '', plotDescription: '' },
  { id: 'cg-4', name: '祭典-烟花夜空', category: 'cg', url: '', tags: ['祭典', '烟花', '夜晚'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前', hasDiff: true, diffCount: 3, plotNode: '', plotDescription: '' },
  // BGM
  { id: 'bgm-1', name: '春日の出会い', category: 'bgm', url: '', tags: ['欢快', '春天', '日常'], usageCount: 6, usedIn: ['第一章', '第二章', '第三章'], status: 'generated', createdAt: '1小时前' },
  { id: 'bgm-2', name: '日常のひととき', category: 'bgm', url: '', tags: ['日常', '轻松', '温暖'], usageCount: 4, usedIn: ['第一章', '第二章'], status: 'generated', createdAt: '1小时前' },
  { id: 'bgm-3', name: '夕暮れの想い', category: 'bgm', url: '', tags: ['感伤', '傍晚', '回忆'], usageCount: 2, usedIn: ['第三章'], status: 'generated', createdAt: '45分钟前' },
  { id: 'bgm-4', name: '桜の花びら', category: 'bgm', url: '', tags: ['樱花', '浪漫', '钢琴'], usageCount: 1, usedIn: ['第四章'], status: 'generated', createdAt: '30分钟前' },
  { id: 'bgm-5', name: '悲しみの雨', category: 'bgm', url: '', tags: ['悲伤', '雨天', '弦乐'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前' },
  // Sound Effects
  { id: 'se-1', name: '脚步声-室内', category: 'se', url: '', tags: ['脚步', '室内'], usageCount: 8, usedIn: ['第一章', '第二章', '第三章'], status: 'generated', createdAt: '1小时前' },
  { id: 'se-2', name: '开门声', category: 'se', url: '', tags: ['门', '开'], usageCount: 3, usedIn: ['第一章', '第二章'], status: 'generated', createdAt: '1小时前' },
  { id: 'se-3', name: '下课铃', category: 'se', url: '', tags: ['铃声', '学校'], usageCount: 2, usedIn: ['第一章'], status: 'generated', createdAt: '45分钟前' },
  { id: 'se-4', name: '风声-微风', category: 'se', url: '', tags: ['风', '自然'], usageCount: 1, usedIn: ['第四章'], status: 'generated', createdAt: '30分钟前' },
  { id: 'se-5', name: '蝉鸣-夏', category: 'se', url: '', tags: ['蝉', '夏天', '自然'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前' },
  // Voice
  { id: 'voice-1', name: '樱井 阳菜 -  greeting', category: 'voice', url: '', tags: ['阳菜', '问候'], usageCount: 1, usedIn: ['第一章'], status: 'placeholder', createdAt: '30分钟前' },
  { id: 'voice-2', name: '的场 蓮 - 挨拶', category: 'voice', url: '', tags: ['蓮', '挨拶'], usageCount: 0, usedIn: [], status: 'placeholder', createdAt: '30分钟前' },
]
