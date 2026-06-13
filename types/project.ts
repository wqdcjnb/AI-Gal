// AI-Gal 项目数据类型定义

// 游戏分类
export type GameCategory =
  | "校园"
  | "奇幻"
  | "悬疑"
  | "异世界"
  | "日常"
  | "科幻"
  | "恋爱"
  | "古风"

// 故事篇幅
export type StoryLength = "短篇" | "中篇" | "长篇"

// 角色出场位置
export type CharacterPosition = "左" | "中" | "右"

// 角色表情
export type CharacterExpression =
  | "微笑"
  | "委屈"
  | "生气"
  | "惊讶"
  | "害羞"
  | "悲伤"
  | "傲娇"
  | "温柔"
  | "腹黑"
  | "冷淡"

// 角色着装类型
export type SpriteType = "正装" | "日常" | "Q版"

// 语气类型
export type ToneType = "傲娇" | "冷淡" | "温柔" | "腹黑" | "元气" | "成熟" | "慵懒" | "害羞" | "冷静" | "开朗"

// 场景版本
export type SceneVersion = "室内" | "室外" | "昼夜" | "黄昏" | "夜晚"

// 氛围类型
export type MoodType = "温馨" | "紧张" | "悲伤" | "日常" | "激昂" | "神秘" | "欢乐"

// ===== 核心数据类型 =====

// 项目基础信息
export interface Project {
  id: string
  name: string
  description: string
  coverUrl: string
  category: GameCategory
  storyLength: StoryLength
  worldSetting: string
  currentStep: number // 1-6
  createdAt: string
  updatedAt: string
  isArchived: boolean
  isPublic: boolean
}

// 角色立绘素材
export interface CharacterSprite {
  id: string
  type: SpriteType
  expression: CharacterExpression
  imageUrl: string
  isAIGenerated: boolean
  prompt: string
}

// 角色
export interface Character {
  id: string
  projectId: string
  name: string
  identity: string // 职业/身份
  personalityTags: string[] // 性格标签
  description: string // AI 生成的人设文案
  sprites: CharacterSprite[] // 立绘集合
  position: CharacterPosition // 出场位置
  colorNote: string // 配色备注
  voiceStyle: string // 配音风格
  order: number // 排序
  createdAt: string
}

// 章节
export interface Chapter {
  id: string
  projectId: string
  title: string
  summary: string // AI 生成的大纲摘要
  order: number // 排序
  isKeyNode: boolean // 是否关键剧情节点
  branchTriggers: string[] // 分支触发条件
}

// 对话段落
export interface DialogueLine {
  id: string
  chapterId: string
  type: "narration" | "dialogue" | "instruction"
  characterName?: string // 角色名（对话时）
  text: string
  tone?: ToneType
  isAIGenerated: boolean
  order: number
}

// 分支选项
export interface BranchOption {
  id: string
  chapterId: string
  text: string // 选项文本
  targetChapterId: string // 跳转目标章节
  order: number
}

// 背景 CG
export interface BackgroundCG {
  id: string
  projectId: string
  chapterId?: string // 关联章节
  sceneName: string
  version: SceneVersion
  imageUrl: string
  isAIGenerated: boolean
  prompt: string
  isUploaded: boolean
}

// BGM / 音效
export interface AudioAsset {
  id: string
  projectId: string
  name: string
  type: "bgm" | "sound_effect"
  mood: MoodType
  audioUrl: string
  duration: number // 秒
  boundChapterIds: string[] // 绑定的章节
  isAIGenerated: boolean
}

// 导出记录
export interface ExportRecord {
  id: string
  projectId: string
  projectName: string
  exportedAt: string
  fileSize: string
  downloadUrl?: string
  status: "generating" | "ready" | "failed"
}

// 用户收藏
export interface FavoriteWork {
  id: string
  projectId: string
  projectName: string
  authorName: string
  coverUrl: string
  favoritedAt: string
}

// 作品广场项目（公开）
export interface PublicWork {
  id: string
  projectName: string
  authorName: string
  coverUrl: string
  category: GameCategory
  description: string
  previewUrl?: string
  likes: number
  publishedAt: string
}
