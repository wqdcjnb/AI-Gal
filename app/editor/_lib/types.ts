// ==================== Data Model Types ====================

export interface KeyPoint {
  id: string
  text: string
  description?: string // 小节描述/介绍
}

export interface Chapter {
  id: string
  number: number
  title: string
  summary: string
  scenes: string[]
  keyPoints: KeyPoint[]
  route?: 'common' | 'a' | 'b' | 'c' | 'true'
  endingType?: 'GE' | 'NE' | 'BE' | 'TE'
  branchFrom?: string
}

export interface ProjectData {
  id: string
  name: string
  emotionStyle: string
  themeBackground: string
  narrativeStructure: string
  synopsis: string
  chapterCount: number
  chapters: Chapter[]
  endings?: Ending[]
}

// Choice effect (好感度/Flag变化)
export interface ChoiceEffect {
  type: 'affection' | 'flag'
  target: string // characterId or flag name
  value: number | boolean
  operator: 'set' | 'add' | 'subtract'
}

// Choice option with enhanced features
export interface ChoiceOption {
  text: string
  targetSubSectionId: string
  type?: 'normal' | 'hidden' | 'timed' // 选择肢类型（显示方式）
  functionType?: 'branch' | 'affection' | 'flavor' | 'trap' // 功能属性（影响范围）
  condition?: string // 显示条件 (e.g. "affection.c1 >= 50")
  timeout?: number // 限时秒数
  effects?: ChoiceEffect[] // 选择后的效果
  isBadEnd?: boolean // 是否导向 Bad End
}

export interface DialogueLine {
  id: string
  type: 'narration' | 'dialogue' | 'choice'
  characterId?: string
  characterName?: string
  content: string
  spriteId?: string // Which sprite to display during this dialogue
  spriteExpression?: string // 立绘表情 (e.g. "微笑", "惊讶")
  // 演出设置
  bgmChange?: string // BGM变化
  soundEffect?: string // 音效
  cgTrigger?: string // CG触发
  textSpeed?: 'slow' | 'normal' | 'fast' // 文字速度
  screenEffect?: 'none' | 'shake' | 'flash_white' | 'flash_black' // 画面特效
  // For choice type
  choices?: ChoiceOption[]
}

// Sub-section (小节) - each chapter has multiple sub-sections
export interface SubSection {
  id: string
  title: string
  background: string
  bgm: string
  dialogues: DialogueLine[]
  isBranch?: boolean // Whether this sub-section is a branch point
  branchFrom?: string // ID of the choice that leads to this sub-section
  // 分支汇合
  isMergePoint?: boolean // 是否为分支汇合点
  mergeFromIds?: string[] // 从哪些小节汇合而来
  // 结局/路线标记
  endingType?: 'GE' | 'NE' | 'BE' | 'TE' // Good/Normal/Bad/True Ending
  routeName?: string // 所属路线名称（如"樱线"、"雪菜线"）
  // 场景控制
  timeOfDay?: 'none' | 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight' // 时间
  weather?: 'none' | 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy' // 天气
  transition?: 'cut' | 'fade' | 'dissolve' | 'wipe' // 转场
  perspective?: 'first_person' | 'third_person' | 'overhead' | 'side_view' // 视角
}

// Ending (结局) - for multi-ending mode
export interface Ending {
  id: string
  type: 'GE' | 'NE' | 'BE' | 'TE' // Good/Normal/Bad/True Ending
  name: string
  description: string
}

// Sprite (立绘) - reusable character art asset
export interface Sprite {
  id: string
  characterId: string
  name: string // e.g. "微笑", "制服-惊讶"
  type: 'base' | 'expression' | 'outfit' | 'pose'
  frameType?: 'full' | 'half' | 'bust' // 全身/半身/齐胸
  url: string
  tags: string[] // e.g. ['微笑', '开心']
}

export interface Character {
  id: string
  name: string
  color: string
  avatar?: string
  personality?: string
  description?: string
  sprites: Sprite[] // All sprite variations for this character
}

// ==================== Asset Types ====================

export type AssetCategory = 'background' | 'cg' | 'bgm' | 'se' | 'voice'

export interface AssetItem {
  id: string
  name: string
  category: AssetCategory
  url: string
  tags: string[]
  usageCount: number // How many times used in chapters
  usedIn: string[] // Chapter/scene names where used
  status: 'generated' | 'uploaded' | 'placeholder'
  createdAt: string
  // CG-specific fields
  hasDiff?: boolean // Whether this CG has diff versions
  diffCount?: number // Number of diff versions
  plotNode?: string // Associated plot node (e.g., "第一章-第2节")
  plotDescription?: string // Description of the plot moment
}

// ==================== Component Prop Types ====================

export interface ChapterEditProps {
  editingChapterId: string | null
  editTitle: string
  editSummary: string
  onEditTitleChange: (title: string) => void
  onEditSummaryChange: (summary: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditChapter: (chapter: Chapter) => void
  onDeleteChapter: (id: string) => void
  onAddKeyPoint: (chapterId: string, keyPointData?: KeyPoint) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, text: string) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
  onKeyPointClick?: (chapterId: string, keyPointId: string) => void
}

export interface ChapterViewProps extends ChapterEditProps {
  chapters: Chapter[]
}

export interface ChapterCardProps extends ChapterEditProps {
  chapter: Chapter
  index: number
  compact?: boolean
  isMultiEnding?: boolean
  isBranching?: boolean
  displayNumber?: number
}

export interface OutlineTabProps {
  project: ProjectData
  isGenerating: boolean
  onGenerate: (description?: string) => void
  onAddChapter: (route?: 'common' | 'a' | 'b' | 'c' | 'true') => void
  onDeleteChapter: (id: string) => void
  onEditChapter: (chapter: Chapter) => void
  onAddKeyPoint: (chapterId: string, keyPointData?: KeyPoint) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, text: string) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
  onUpdateKeyPointData?: (keyPoint: KeyPoint) => void
  onAddRoute?: (route: string, chapterCount?: number) => void
  onAddEnding?: (ending: Ending) => void
  onUpdateEnding?: (id: string, updates: Partial<Ending>) => void
  onDeleteEnding?: (id: string) => void
  onUpdateEndingData?: (ending: Ending) => void
  onAIGenerateKeyPoint?: (keyPointId: string) => void
  onAIGenerateEnding?: (endingId: string) => void
  isGeneratingKeyPoint?: boolean
  isGeneratingEnding?: boolean
  editingChapterId: string | null
  editTitle: string
  editSummary: string
  onEditTitleChange: (title: string) => void
  onEditSummaryChange: (summary: string) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
}

export interface TreeViewProps extends ChapterViewProps {
  chapters: Chapter[]
  isBranching: boolean
  isMultiEnding?: boolean
  onAddRoute?: (route: string, chapterCount?: number) => void
  onAddChapter?: (route?: 'common' | 'a' | 'b' | 'c' | 'true') => void
  onOpenAddRouteDialog?: () => void
  onEditRoute?: (route: string) => void
}

export interface KeyPointModalProps {
  isOpen: boolean
  onClose: () => void
  keyPoint: KeyPoint | null
  chapterTitle: string
  onSave: (keyPoint: KeyPoint) => void
  onAIGenerate?: (keyPointId: string) => void
  isGenerating?: boolean
}

export interface EndingModalProps {
  isOpen: boolean
  onClose: () => void
  ending: Ending | null
  onSave: (ending: Ending) => void
  onAIGenerate?: (endingId: string) => void
  isGenerating?: boolean
}

export interface AddRouteDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (routeName: string, description: string, chapterCount: number) => void
  onAIGenerate?: () => Promise<{ name?: string; description?: string }>
  isGenerating?: boolean
  initialData?: { routeName?: string; description?: string; chapterCount?: number }
}

export interface ChapterTabProps {
  project: ProjectData
}

export interface SubSectionCardProps {
  subSection: SubSection
  index: number
  isExpanded: boolean
  onToggle: () => void
  onUpdate?: (subSection: SubSection) => void
}

export interface DialogueCardProps {
  dialogue: DialogueLine
  index: number
  onUpdate?: (dialogue: DialogueLine) => void
}
