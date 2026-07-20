import type { Chapter } from '@/app/editor/_lib/types'

// Utility: Convert number to Chinese
export const toChineseNumber = (num: number): string => {
  const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  if (num <= 10) return chineseNums[num]
  if (num < 20) return `十${num === 10 ? '' : chineseNums[num - 10]}`
  if (num < 100) {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return `${chineseNums[tens]}十${ones ? chineseNums[ones] : ''}`
  }
  return num.toString()
}

/**
 * 生成章节骨架（空内容，进编辑器时直接显示结构）
 */
export const generateChapterSkeleton = (narrativeStructure: string, chapterCount: number): Chapter[] => {
  const chapters: Chapter[] = []
  const now = Date.now()

  for (let i = 0; i < chapterCount; i++) {
    chapters.push({
      id: `ch-${now}-${i}`,
      number: i + 1,
      title: `第${i + 1}章`,
      summary: '',
      scenes: [],
      keyPoints: [],
      route: 'common',
    })
  }

  return chapters
}
