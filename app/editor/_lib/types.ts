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
  route?: string
  endingType?: string  // "Good End" | "Normal End" | "Bad End" | "True End" 等
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

// ── Choice option ──
export interface ChoiceOption {
  text: string
}

export interface DialogueLine {
  id: string
  type: 'narration' | 'dialogue' | 'choice'
  characterId?: string
  characterName?: string
  characterColor?: string
  spritePosition?: 'left' | 'center' | 'right'
  content: string
  // 立绘
  spriteId?: string
  spriteExpression?: string
  spriteOutfit?: string
  spritePose?: string
  // 演出设置
  backgroundChange?: string
  bgmChange?: string
  soundEffect?: string
  cgTrigger?: string
  screenEffect?: 'none' | 'shake' | 'flash_white' | 'flash_black'
  transition?: 'cut' | 'fade' | 'dissolve' | 'wipe'
  // 语音
  voiceId?: string
  voiceEmotion?: string
  // For choice type
  choices?: ChoiceOption[]
}

// ── Trigger (触发器) ──
export interface TriggerCondition {
  choiceDialogueId: string
  optionIndex: number
}

export interface Trigger {
  id: string
  name: string
  conditions: TriggerCondition[]
  logic: 'and' | 'or'
  jumpTarget: string
}

// Sub-section (小节)
export interface SubSection {
  id: string
  title: string
  background: string
  bgm: string
  cgTrigger?: string
  transition?: 'cut' | 'fade' | 'dissolve' | 'wipe'
  dialogues: DialogueLine[]
  triggers: Trigger[]
  isBranch?: boolean
  branchFrom?: string
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
  cardColors?: { border: string; shadow: string; numberBg: string; numberText: string; dot: string; hoverBg: string; buttonText: string; focusRing: string }
}

export interface OutlineTabProps {
  project: ProjectData
  isGenerating: boolean
  onGenerate: (description?: string) => void
  onAddChapter: (route?: string) => void
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
  onAddChapter?: (route?: string) => void
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
  onDelete?: () => void
  onAIGenerate?: () => Promise<{ name?: string; description?: string }>
  isGenerating?: boolean
  initialData?: { routeName?: string; endingType?: string; description?: string; chapterCount?: number }
  isEndingMode?: boolean
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
  allSubSections?: { id: string; title: string }[]
  subSectionTree?: { value: string; label: string; children?: { value: string; label: string }[] }[]
}

export interface DialogueCardProps {
  dialogue: DialogueLine
  index: number
  onUpdate?: (dialogue: DialogueLine) => void
  onDelete?: () => void
  subSectionIds?: { id: string; title: string }[]
  onDragStart?: (e: React.DragEvent, index: number) => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent, index: number) => void
}
