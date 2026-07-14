import type { Chapter, SubSection, DialogueLine } from '@/app/editor/_lib/types'

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

// Mock sub-sections for chapter editor
export const generateMockSubSections = (chapter: Chapter): SubSection[] => {
  const subSections: SubSection[] = []

  // Generate 2-3 sub-sections per chapter based on key points
  const subSectionCount = Math.max(2, Math.min(chapter.keyPoints.length || 2, 3))
  for (let i = 0; i < subSectionCount; i++) {
    const dialogues: DialogueLine[] = [
      {
        id: `d-${chapter.id}-${i}-1`,
        type: 'narration',
        content: `${chapter.scenes[i] || '场景' + (i + 1)}。阳光透过窗户洒进教室，空气中弥漫着青春的气息。`,
      },
      {
        id: `d-${chapter.id}-${i}-2`,
        type: 'dialogue',
        characterId: 'c1',
        characterName: '桜',
        content: chapter.keyPoints[i]?.text || '今天的天气真好呢...',
      },
      {
        id: `d-${chapter.id}-${i}-3`,
        type: 'dialogue',
        characterId: 'c2',
        characterName: '主人公',
        content: '（她的笑容如同春日暖阳，让人不自觉地放松下来。）',
      },
    ]

    // Add choice for the last sub-section in common route (branching point)
    if (i === subSectionCount - 1 && chapter.route === 'common') {
      dialogues.push({
        id: `d-${chapter.id}-${i}-4`,
        type: 'choice',
        content: '是否接受她的邀请？',
        choices: [
          { text: '接受邀请', targetSubSectionId: `sub-${chapter.id}-a` },
          { text: '婉言谢绝', targetSubSectionId: `sub-${chapter.id}-b` },
        ],
      })
    }

    subSections.push({
      id: `sub-${chapter.id}-${i}`,
      title: `${i + 1}. ${chapter.keyPoints[i]?.text || chapter.scenes[i] || '场景' + (i + 1)}`,
      background: chapter.scenes[i] || '教室',
      bgm: i === 0 ? '春日の出会い' : '日常のひととき',
      dialogues,
    })
  }

  return subSections
}

// Mock AI outline generator
export const generateMockOutline = (projectName: string, narrativeStructure: string, count: number, description?: string, _requirements?: string): Chapter[] => {
  const commonRouteTemplates = [
    { title: '序章 - 命运的开端', scenes: ['教室', '上学路'], keyPoints: ['主人公的日常介绍', '故事背景铺垫'] },
    { title: '相遇', scenes: ['樱花树下', '教室'], keyPoints: ['与女主角初次相遇', '留下深刻印象'] },
    { title: '日常的变化', scenes: ['社团教室', '天台'], keyPoints: ['关系逐渐建立', '发现共同兴趣'] },
    { title: '心动时刻', scenes: ['放学路', '公园'], keyPoints: ['情感悄悄萌芽', '意识到特别的存在'] },
  ]

  const branchTemplates = [
    { title: '波折', scenes: ['学校', '家中'], keyPoints: ['突发事件打破平衡', '面临选择'], endingType: undefined as 'GE' | 'NE' | 'BE' | 'TE' | undefined }
  ]

  const endingTemplates = {
    a: { title: '樱花线 - 重逢', scenes: ['樱花树下'], keyPoints: ['解开心结', '重逢'], endingType: 'GE' as const },
    b: { title: '雪乃线 - 告别', scenes: ['车站'], keyPoints: ['选择离开', '留下回忆'], endingType: 'NE' as const },
  }

  const chapters: Chapter[] = []
  const isBranching = narrativeStructure === '分支叙事' || narrativeStructure === '多结局'
  const isMultiEnding = narrativeStructure === '多结局'

  if (isMultiEnding) {
    // Multi-ending mode: no common route, just separate routes with endings
    const routes: Array<'a' | 'b' | 'true'> = ['a', 'b', 'true']
    const chaptersPerRoute = Math.max(1, Math.floor(count / routes.length))
    const endingTypes: Array<'GE' | 'NE' | 'BE' | 'TE'> = ['GE', 'NE', 'TE']

    for (let r = 0; r < routes.length; r++) {
      const routeKey = routes[r]
      for (let i = 0; i < chaptersPerRoute; i++) {
        const isLast = i === chaptersPerRoute - 1
        const chapterNum = r * chaptersPerRoute + i + 1
        const template = isLast ? endingTemplates[routeKey as 'a' | 'b'] || branchTemplates[0] : branchTemplates[0]

        chapters.push({
          id: `ch-${Date.now()}-${chapterNum}`,
          number: chapterNum,
          title: `第${chapterNum}章`,
          summary: isLast ? `${routeKey}路线结局...` : `${routeKey}路线第${i + 1}章...`,
          scenes: [],
          keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${chapterNum}-${idx}`, text })),
          route: routeKey,
          endingType: isLast ? (endingTypes[r] || 'GE') : undefined,
        })
      }
    }
  } else if (isBranching) {
    // Branching mode: common route (2-3 chapters) + personal routes (3-5 chapters each)
    const commonCount = Math.min(3, Math.max(2, Math.floor(count / 4)))
    for (let i = 0; i < commonCount; i++) {
      const template = commonRouteTemplates[i % commonRouteTemplates.length]
      chapters.push({
        id: `ch-${Date.now()}-${i}`,
        number: i + 1,
        title: `第${i + 1}章`,
        summary: `${template.title}的故事内容...`,
        scenes: template.scenes,
        keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${i}-${idx}`, text })),
        route: 'common',
      })
    }

    // Branch point
    const branchChapter = chapters[commonCount - 1]

    // Personal routes: each route gets 3-5 chapters
    const routes: Array<'a' | 'b'> = ['a', 'b']
    const remainingChapters = count - commonCount
    const chaptersPerRoute = Math.max(3, Math.floor(remainingChapters / routes.length))

    for (let r = 0; r < routes.length; r++) {
      const routeKey = routes[r]

      for (let i = 0; i < chaptersPerRoute; i++) {
        const isLast = i === chaptersPerRoute - 1
        const template = isLast ? endingTemplates[routeKey] : branchTemplates[0]
        const chapterNum = commonCount + r * chaptersPerRoute + i + 1

        chapters.push({
          id: `ch-${Date.now()}-${chapterNum}`,
          number: chapterNum,
          title: `第${chapterNum}章`,
          summary: `${template.title}的故事内容...`,
          scenes: template.scenes,
          keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${chapterNum}-${idx}`, text })),
          route: routeKey,
          endingType: isLast ? template.endingType : undefined,
          branchFrom: branchChapter.id,
        })
      }
    }
  } else {
    // Linear narrative
    for (let i = 0; i < count; i++) {
      const template = commonRouteTemplates[i % commonRouteTemplates.length]
      const isLast = i === count - 1
      chapters.push({
        id: `ch-${Date.now()}-${i}`,
        number: i + 1,
        title: `第${i + 1}章`,
        summary: `${template.title}的故事内容...`,
        scenes: template.scenes,
        keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${i}-${idx}`, text })),
        route: 'common',
        endingType: isLast ? 'GE' : undefined,
      })
    }
  }

  return chapters
}
