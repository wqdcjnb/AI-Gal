/**
 * AI-Gal 数据库 Schema 定义 & 初始化模块
 *
 * CloudBase NoSQL 文档数据库（MongoDB 兼容）
 * 总共 10 个集合（Collections），大文件走 CloudBase 云存储
 *
 * 集合清单：
 *   users             — 用户扩展信息（昵称、头像）
 *   projects          — 项目主表
 *   characters        — 角色
 *   character_sprites — 角色立绘（1角色 : N立绘）
 *   chapters          — 章节大纲
 *   dialogues         — 对话行（1章 : N行）
 *   branches          — 分支选项
 *   backgrounds       — 背景 CG
 *   audio_assets      — BGM / 音效
 *   export_records    — 导出历史
 *   favorites         — 用户收藏
 */

// ============================================================
// 类型定义
// ============================================================

// --- users ---
export interface UserDoc {
  _id: string
  uid: string // CloudBase Auth uid
  email: string
  username: string // CloudBase Auth 登录用户名（注册时生成）
  nickname: string // 显示名称（用户可修改）
  avatarUrl: string
  createdAt: number
  updatedAt: number
}

// --- projects ---
export interface ProjectDoc {
  _id: string
  userId: string
  name: string
  description: string
  coverUrl: string // CloudBase 存储 fileId
  category: "校园" | "奇幻" | "悬疑" | "异世界" | "日常" | "科幻" | "恋爱" | "古风"
  storyLength: "短篇" | "中篇" | "长篇"
  worldSetting: string
  currentStep: number // 1-6
  isArchived: boolean
  isPublic: boolean
  publishedAt: number | null // 公开时间戳
  createdAt: number // serverDate
  updatedAt: number
}

// --- characters ---
export interface CharacterDoc {
  _id: string
  projectId: string
  userId: string
  name: string
  identity: string
  personalityTags: string[]
  description: string
  position: "左" | "中" | "右"
  colorNote: string
  voiceStyle: string
  order: number
  createdAt: number
  updatedAt: number
}

// --- character_sprites ---
export interface CharacterSpriteDoc {
  _id: string
  characterId: string
  projectId: string
  type: "正装" | "日常" | "Q版"
  expression: string // "微笑" | "害羞" | "生气" | ...
  imageUrl: string // CloudBase 存储 fileId
  isAIGenerated: boolean
  prompt: string // 绘图提示词
  createdAt: number
}

// --- chapters ---
export interface ChapterDoc {
  _id: string
  projectId: string
  userId: string
  title: string
  summary: string
  order: number
  isKeyNode: boolean
  branchTriggers: string[]
  createdAt: number
  updatedAt: number
}

// --- dialogues ---
export interface DialogueDoc {
  _id: string
  chapterId: string
  projectId: string
  type: "narration" | "dialogue" | "instruction"
  characterName: string | null
  text: string
  tone: string | null // "傲娇" | "温柔" | "腹黑" | ...
  isAIGenerated: boolean
  order: number
  createdAt: number
}

// --- branches ---
export interface BranchDoc {
  _id: string
  chapterId: string
  projectId: string
  text: string // 选项文本
  targetChapterId: string // 跳转目标章节
  order: number
  createdAt: number
}

// --- backgrounds ---
export interface BackgroundDoc {
  _id: string
  projectId: string
  chapterId: string | null // 可为空
  sceneName: string
  version: "室内" | "室外" | "昼夜" | "黄昏" | "夜晚"
  imageUrl: string // CloudBase 存储 fileId
  isAIGenerated: boolean
  prompt: string
  isUploaded: boolean
  createdAt: number
}

// --- audio_assets ---
export interface AudioAssetDoc {
  _id: string
  projectId: string
  name: string
  type: "bgm" | "sound_effect"
  mood: "温馨" | "紧张" | "悲伤" | "日常" | "激昂" | "神秘" | "欢乐"
  audioUrl: string // CloudBase 存储 fileId
  duration: number // 秒
  boundChapterIds: string[]
  isAIGenerated: boolean
  createdAt: number
}

// --- export_records ---
export interface ExportRecordDoc {
  _id: string
  projectId: string
  userId: string
  projectName: string
  fileSize: string // "24.5 MB"
  downloadUrl: string // CloudBase 存储 fileId (ZIP)
  status: "generating" | "ready" | "failed"
  exportedAt: number
}

// --- favorites ---
export interface FavoriteDoc {
  _id: string
  userId: string
  projectId: string
  projectName: string
  authorName: string
  coverUrl: string
  favoritedAt: number
}

// ============================================================
// 集合名常量
// ============================================================

export const COLLECTIONS = {
  USERS: "users",
  PROJECTS: "projects",
  CHARACTERS: "characters",
  CHARACTER_SPRITES: "character_sprites",
  CHAPTERS: "chapters",
  DIALOGUES: "dialogues",
  BRANCHES: "branches",
  BACKGROUNDS: "backgrounds",
  AUDIO_ASSETS: "audio_assets",
  EXPORT_RECORDS: "export_records",
  FAVORITES: "favorites",
} as const

// ============================================================
// 索引定义
// ============================================================

export interface IndexDef {
  collection: string
  name: string // 索引名称
  keys: Record<string, 1 | -1> // 1=升序, -1=降序
  unique?: boolean
}

export const INDEXES: IndexDef[] = [
  // users
  {
    collection: COLLECTIONS.USERS,
    name: "idx_uid",
    keys: { uid: 1 },
    unique: true,
  },
  {
    collection: COLLECTIONS.USERS,
    name: "idx_email",
    keys: { email: 1 },
  },

  // projects
  {
    collection: COLLECTIONS.PROJECTS,
    name: "idx_userId_updatedAt",
    keys: { userId: 1, updatedAt: -1 },
  },
  {
    collection: COLLECTIONS.PROJECTS,
    name: "idx_isPublic_publishedAt",
    keys: { isPublic: 1, publishedAt: -1 },
  },

  // characters
  {
    collection: COLLECTIONS.CHARACTERS,
    name: "idx_projectId_order",
    keys: { projectId: 1, order: 1 },
  },

  // character_sprites
  {
    collection: COLLECTIONS.CHARACTER_SPRITES,
    name: "idx_characterId",
    keys: { characterId: 1 },
  },
  {
    collection: COLLECTIONS.CHARACTER_SPRITES,
    name: "idx_projectId",
    keys: { projectId: 1 },
  },

  // chapters
  {
    collection: COLLECTIONS.CHAPTERS,
    name: "idx_projectId_order",
    keys: { projectId: 1, order: 1 },
  },

  // dialogues
  {
    collection: COLLECTIONS.DIALOGUES,
    name: "idx_chapterId_order",
    keys: { chapterId: 1, order: 1 },
  },
  {
    collection: COLLECTIONS.DIALOGUES,
    name: "idx_projectId",
    keys: { projectId: 1 },
  },

  // branches
  {
    collection: COLLECTIONS.BRANCHES,
    name: "idx_chapterId",
    keys: { chapterId: 1 },
  },
  {
    collection: COLLECTIONS.BRANCHES,
    name: "idx_projectId",
    keys: { projectId: 1 },
  },

  // backgrounds
  {
    collection: COLLECTIONS.BACKGROUNDS,
    name: "idx_projectId_chapterId",
    keys: { projectId: 1, chapterId: 1 },
  },

  // audio_assets
  {
    collection: COLLECTIONS.AUDIO_ASSETS,
    name: "idx_projectId",
    keys: { projectId: 1 },
  },

  // export_records
  {
    collection: COLLECTIONS.EXPORT_RECORDS,
    name: "idx_userId",
    keys: { userId: 1, exportedAt: -1 },
  },
  {
    collection: COLLECTIONS.EXPORT_RECORDS,
    name: "idx_projectId",
    keys: { projectId: 1 },
  },

  // favorites (唯一索引防止重复收藏)
  {
    collection: COLLECTIONS.FAVORITES,
    name: "idx_userId_projectId",
    keys: { userId: 1, projectId: 1 },
    unique: true,
  },
  {
    collection: COLLECTIONS.FAVORITES,
    name: "idx_userId",
    keys: { userId: 1, favoritedAt: -1 },
  },
]

// ============================================================
// 常用查询模式参考
// ============================================================

/**
 * 查询模式速查表:
 *
 * 【我的项目列表】db.collection("projects")
 *   .where({ userId, isArchived: false })
 *   .orderBy("updatedAt", "desc").limit(20).get()
 *
 * 【项目角色列表】db.collection("characters")
 *   .where({ projectId }).orderBy("order", "asc").get()
 *
 * 【角色所有立绘】db.collection("character_sprites")
 *   .where({ characterId }).get()
 *
 * 【项目所有章节】db.collection("chapters")
 *   .where({ projectId }).orderBy("order", "asc").get()
 *
 * 【章节对话】db.collection("dialogues")
 *   .where({ chapterId }).orderBy("order", "asc").get()
 *
 * 【章节分支】db.collection("branches")
 *   .where({ chapterId }).orderBy("order", "asc").get()
 *
 * 【项目背景(按章节)】db.collection("backgrounds")
 *   .where({ projectId, chapterId }).get()
 *
 * 【项目音频】db.collection("audio_assets")
 *   .where({ projectId }).get()
 *
 * 【导出历史】db.collection("export_records")
 *   .where({ userId }).orderBy("exportedAt", "desc").get()
 *
 * 【我的收藏】db.collection("favorites")
 *   .where({ userId }).orderBy("favoritedAt", "desc").get()
 *
 * 【作品广场】db.collection("projects")
 *   .where({ isPublic: true }).orderBy("publishedAt", "desc").limit(20).get()
 *
 * 【删除项目级联】
 *   删除 project → 同时删除 characters, character_sprites, chapters,
 *   dialogues, branches, backgrounds, audio_assets 中所有 projectId 匹配的文档
 */
