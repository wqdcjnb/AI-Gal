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
export const generateMockOutline = (projectName: string, narrativeStructure: string, count: number, _description?: string, _requirements?: string): Chapter[] => {
  const commonRouteTemplates = [
    { title: '序章 - 命运的开端', scenes: ['教室', '上学路'], keyPoints: ['主人公的日常介绍', '故事背景铺垫'] },
    { title: '相遇', scenes: ['樱花树下', '教室'], keyPoints: ['与女主角初次相遇', '留下深刻印象'] },
    { title: '日常的变化', scenes: ['社团教室', '天台'], keyPoints: ['关系逐渐建立', '发现共同兴趣'] },
    { title: '心动时刻', scenes: ['放学路', '公园'], keyPoints: ['情感悄悄萌芽', '意识到特别的存在'] },
  ]

  const branchTemplates = [
    { title: '波折', scenes: ['学校', '家中'], keyPoints: ['突发事件打破平衡', '面临选择'] }
  ]

  const isBranching = narrativeStructure === '分支叙事' || narrativeStructure === '多结局'
  const isMultiEnding = narrativeStructure === '多结局'
  const chapters: Chapter[] = []

  if (isMultiEnding) {
    // Multi-ending mode: linear chapters WITHOUT route labels (no 共通线 / A线 / B线)
    // Endings are separate chapters appended after the main story
    const multiEndingTemplates = [
      { title: '序章 - 命运的开端', scenes: ['教室', '上学路'], keyPoints: ['主人公的日常介绍', '故事背景铺垫'] },
      { title: '相遇', scenes: ['樱花树下', '教室'], keyPoints: ['与女主角初次相遇', '留下深刻印象'] },
      { title: '日常的变化', scenes: ['社团教室', '天台'], keyPoints: ['关系逐渐建立', '发现共同兴趣'] },
      { title: '心动时刻', scenes: ['放学路', '公园'], keyPoints: ['情感悄悄萌芽', '意识到特别的存在'] },
      { title: '波折', scenes: ['学校', '家中'], keyPoints: ['突发事件打破平衡', '面临选择'] },
      { title: '转折', scenes: ['天台', '黄昏'], keyPoints: ['关键事件发生', '命运的分岔路'] },
      { title: '追逐', scenes: ['街头', '车站'], keyPoints: ['追赶重要的人', '做出决定'] },
      { title: '表白', scenes: ['河边', '星空下'], keyPoints: ['倾诉真心', '回应心意'] },
      { title: '考验', scenes: ['未知', '内心'], keyPoints: ['最后的困难', '坚强面对'] },
      { title: '选择', scenes: ['熟悉的教室'], keyPoints: ['最终的选择时刻', '故事走向结局'] },
    ]

    for (let i = 0; i < count; i++) {
      const template = multiEndingTemplates[i % multiEndingTemplates.length]
      chapters.push({
        id: `ch-${Date.now()}-${i}`,
        number: i + 1,
        title: `第${i + 1}章`,
        summary: `${template.title}的故事内容...`,
        scenes: template.scenes,
        keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${i}-${idx}`, text })),
      })
    }

    // Append ending chapters AFTER the main chapters (not counted in chapterCount)
    const endingChapterTemplates: Array<{ title: string; scenes: string[]; keyPoints: string[]; endingType: 'GE' | 'NE' | 'BE' | 'TE' }> = [
      { title: '美好结局', scenes: ['樱花树下'], keyPoints: ['最终抉择', '幸福结局'], endingType: 'GE' },
      { title: '平凡结局', scenes: ['教室'], keyPoints: ['回归日常', '留下回忆'], endingType: 'NE' },
      { title: '悲伤结局', scenes: ['雨中'], keyPoints: ['无法挽回', '命运弄人'], endingType: 'BE' },
      { title: '真结局', scenes: ['星夜'], keyPoints: ['揭开真相', '真正的结局'], endingType: 'TE' },
    ]

    for (let e = 0; e < endingChapterTemplates.length; e++) {
      const tpl = endingChapterTemplates[e]
      const chapterNum = count + e + 1
      chapters.push({
        id: `ch-ending-${Date.now()}-${e}`,
        number: chapterNum,
        title: tpl.title,
        summary: tpl.keyPoints.join('，') + '…',
        scenes: tpl.scenes,
        keyPoints: tpl.keyPoints.map((text, idx) => ({ id: `kp-end-${e}-${idx}`, text })),
        endingType: tpl.endingType,
      })
    }
  } else if (isBranching) {
    // Branching mode: common route + A/B/C/True routes (no endingType — endings are only for multi-ending)
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

    // Personal routes: A/B 线 (no endingType)
    const routes: Array<'a' | 'b'> = ['a', 'b']
    const remainingChapters = count - commonCount
    const chaptersPerRoute = Math.max(2, Math.floor(remainingChapters / routes.length))

    for (let r = 0; r < routes.length; r++) {
      const routeKey = routes[r]
      const routeName = routeKey === 'a' ? 'A线' : 'B线'

      for (let i = 0; i < chaptersPerRoute; i++) {
        const chapterNum = commonCount + r * chaptersPerRoute + i + 1
        const template = branchTemplates[i % branchTemplates.length]

        chapters.push({
          id: `ch-${Date.now()}-${chapterNum}`,
          number: chapterNum,
          title: `第${chapterNum}章`,
          summary: `${routeName} 第${i + 1}章…`,
          scenes: template.scenes,
          keyPoints: template.keyPoints.map((text, idx) => ({ id: `kp-${chapterNum}-${idx}`, text })),
          route: routeKey,
          branchFrom: branchChapter.id,
        })
      }
    }
  } else {
    // Linear narrative: sequential chapters, common route only
    for (let i = 0; i < count; i++) {
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
  }

  return chapters
}
