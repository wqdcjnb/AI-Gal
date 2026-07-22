// ==================== Data Model Types ====================

export interface KeyPoint {
  id: string
  text: string
}

export interface Chapter {
  id: string
  number: number
  title: string
  summary: string
  keyPoints: KeyPoint[]
  route?: string
  endingType?: string  // "Good End" | "Normal End" | "Bad End" | "True End" 等
}

export interface ProjectData {
  id: string
  name: string
  emotionStyle: string
  themeBackground: string
  narrativeStructure: string
  synopsis: string
  chapters: Chapter[]
  version?: number
}

// ── Choice option ──
export interface ChoiceOption {
  text: string
}

export interface DialogueLine {
  id: string
  type: 'narration' | 'dialogue' | 'choice' | 'scene'
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
  dialogues: DialogueLine[]
  triggers: Trigger[]
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
  appearance?: string[]
  temperament?: string[]
  extraDescription?: string
  sprites: Sprite[] // All sprite variations for this character
}

// ==================== Asset Types ====================

export type AssetCategory = 'background' | 'cg' | 'bgm' | 'se'

export interface AssetItem {
  id: string
  name: string
  category: AssetCategory
  url: string
  size: number
  usageCount: number
  usedIn: string[]
  createdAt: string
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
  onAddChapter: (route?: string, endingType?: string) => void
  onDeleteChapter: (id: string) => void
  onEditChapter: (chapter: Chapter) => void
  onAddKeyPoint: (chapterId: string, keyPointData?: KeyPoint) => void
  onUpdateKeyPoint: (chapterId: string, keyPointId: string, text: string) => void
  onDeleteKeyPoint: (chapterId: string, keyPointId: string) => void
  onUpdateKeyPointData?: (keyPoint: KeyPoint) => void
  onAddRoute?: (route: string, chapterCount?: number) => void
  onAIGenerateKeyPoint?: (keyPointId: string) => void
  isGeneratingKeyPoint?: boolean
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
  onAddChapter?: (route?: string, endingType?: string) => void
  onOpenAddRouteDialog?: () => void
  onEditRoute?: (route: string) => void
}

export interface KeyPointModalProps {
  isOpen: boolean
  onClose: () => void
  keyPoint: KeyPoint | null
  chapterTitle: string
  onSave: (keyPoint: KeyPoint) => void
  onDelete?: (keyPointId: string) => void
  onAIGenerate?: (keyPointId: string) => void
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

// Saved sprite combination (gallery item)
export interface SavedCombo {
  id: string
  spriteId: string
  expressionId?: string
  outfitId?: string
  poseId?: string
  name: string
  url?: string
}
