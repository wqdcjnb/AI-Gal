/**
 * GET /api/projects/[id]/full   — 加载项目全部数据
 * PATCH /api/projects/[id]/full — 保存章节和结局
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  getProject, listChapters, listKeyPoints,
  listCharacters, listSpriteCombos, listSprites, listSubSections, listAssets,
  saveChapters, updateProject,
  saveSubSections, saveKeyPoints, saveCharacters, saveSpriteCombos,
  saveSprites,
} from "@/lib/db/project-store"
import { deleteFromStorage } from "@/lib/storage/pg-storage"

const COOKIE_NAME = "cloudbase_token"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  if (!parsed?.uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { id } = await params

  const [projRes, chRes] = await Promise.all([
    getProject(id),
    listChapters(id),
  ])

  if (!projRes.data) {
    return NextResponse.json({ success: false, message: "项目不存在" }, { status: 404 })
  }

  // 加载每个章节的 key_points 并拼到 chapter 上
  const chaptersWithKeyPoints = await Promise.all(
    (chRes.data || []).map(async (ch: any) => {
      const { data: kps } = await listKeyPoints(ch.id)
      return {
        ...ch,
        endingType: ch.ending_type,
        keyPoints: (kps || []).map((kp: any) => ({
          id: kp.id,
          text: kp.text,
        })),
      }
    })
  )

  // 加载角色
  const { data: charList } = await listCharacters(id)

  // 加载每个角色的 sprites
  if (charList?.length) {
    await Promise.all(charList.map(async (ch: any) => {
      const { data: sprites } = await listSprites(ch.id)
      ch.sprites = (sprites || []).map((s: any) => ({
        id: s.id,
        characterId: s.character_id,
        name: s.name,
        type: s.type,
        frameType: s.frame_type,
        url: s.url,
        tags: typeof s.tags === 'string' ? JSON.parse(s.tags || '[]') : (s.tags || []),
      }))
    }))
  }

  // 加载立绘组合（按 character_id 分组）
  const spriteCombos: Record<string, any[]> = {}
  if (charList?.length) {
    await Promise.all(charList.map(async (ch: any) => {
      const { data: combos } = await listSpriteCombos(ch.id)
      if (combos?.length) spriteCombos[ch.id] = combos.map((c: any) => ({
        id: c.id,
        spriteId: c.sprite_id,
        expressionId: c.expression_id,
        outfitId: c.outfit_id,
        poseId: c.pose_id,
        name: c.name,
        url: c.url,
      }))
    }))
  }

  // 加载所有小节的对话数据（按 chapter_id 分组）
  const subSections: Record<string, any[]> = {}
  await Promise.all(chaptersWithKeyPoints.map(async (ch: any) => {
    const { data: subs } = await listSubSections(ch.id)
    if (subs?.length) {
      subSections[ch.id] = subs.map((s: any) => ({
        id: s.id,
        title: s.title,
        dialogues: typeof s.dialogues === 'string' ? JSON.parse(s.dialogues || '[]') : (s.dialogues || []),
        triggers: typeof s.triggers === 'string' ? JSON.parse(s.triggers || '[]') : (s.triggers || []),
      }))
    }
  }))

  // 加载素材
  const { data: assetList } = await listAssets(id)

  return NextResponse.json({
    success: true,
    data: {
      project: projRes.data,
      chapters: chaptersWithKeyPoints,
      assets: assetList || [],
      characters: (charList || []).map((c: any) => ({
        ...c,
        sprites: c.sprites || [],
        appearance: typeof c.appearance === 'string' ? JSON.parse(c.appearance || '[]') : (c.appearance || []),
        temperament: typeof c.temperament === 'string' ? JSON.parse(c.temperament || '[]') : (c.temperament || []),
        extraDescription: c.extra_description,
        voiceProfileId: c.voice_profile_id || null,
      })),
      sprite_combos: spriteCombos,
      sub_sections: subSections,
    },
  })
}

// POST — sendBeacon 用 POST，逻辑同 PATCH
export { PATCH as POST }

// PATCH — 保存章节 + 结局 + 元数据
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  if (!parsed?.uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { id } = await params

  try {
    const body = await request.json()

    // 保存章节（前端 camelCase → DB snake_case）
    if (body.chapters) {
      const chapters = body.chapters.map((ch: any) => ({
        id: ch.id,
        project_id: id,
        number: ch.number,
        title: ch.title || '',
        summary: ch.summary || '',
        route: ch.route || 'common',
        ending_type: ch.endingType || null,
        created_at: ch.created_at || Date.now(),
        updated_at: Date.now(),
      }))
      await saveChapters(id, chapters)

      // key_points: 并行保存所有章节
      await Promise.all(body.chapters.map((ch: any) =>
        saveKeyPoints(ch.id, (ch.keyPoints || []).map((kp: any, i: number) => ({
          id: kp.id,
          chapter_id: ch.id,
          text: kp.text || '',
          sort_order: i,
        })))
      ))
    }

    // 保存小节（按 chapter_id 分组后逐章写入）
    if (body.sub_sections) {
      const byChapter: Record<string, any[]> = {}
      for (const sub of body.sub_sections) {
        const cid = sub.chapter_id || sub.chapterId
        if (!byChapter[cid]) byChapter[cid] = []
        byChapter[cid].push({
          id: sub.id,
          chapter_id: cid,
          title: sub.title || '',
          dialogues: typeof sub.dialogues === 'string' ? sub.dialogues : JSON.stringify(sub.dialogues || []),
          triggers: typeof sub.triggers === 'string' ? sub.triggers : JSON.stringify(sub.triggers || []),
          sort_order: sub.sort_order ?? 0,
        })
      }
      await Promise.all(Object.entries(byChapter).map(([cid, subs]) =>
        saveSubSections(cid, subs)
      ))
    }

    // 并行保存立绘组合
    if (body.sprite_combos) {
      await Promise.all(Object.entries(body.sprite_combos).map(async ([characterId, combos]) => {
        if (!Array.isArray(combos)) return
        const { data: oldCombos } = await listSpriteCombos(characterId)
        const oldComboIds = new Set((oldCombos || []).map((oc: any) => oc.id))
        const newComboIds = new Set((combos as any[]).map((c: any) => c.id))
        for (const oc of (oldCombos || [])) {
          if (!newComboIds.has((oc as any).id) && (oc as any).url) {
            deleteFromStorage((oc as any).url).catch(() => {})
          }
        }
        await saveSpriteCombos(characterId, combos.map((c: any) => ({
          id: c.id,
          character_id: characterId,
          sprite_id: c.spriteId || null,
          expression_id: c.expressionId || null,
          outfit_id: c.outfitId || null,
          pose_id: c.poseId || null,
          name: c.name || '',
          url: c.url || null,
        })))
      }))
    }

    // 保存角色 + 立绘
    if (body.characters) {
      const chars = body.characters.map((c: any) => ({
        id: c.id,
        project_id: id,
        name: c.name || '',
        color: c.color || '#ec4899',
        avatar: c.avatar || null,
        appearance: JSON.stringify(c.appearance || []),
        temperament: JSON.stringify(c.temperament || []),
        extra_description: c.extraDescription || null,
        voice_profile_id: c.voiceProfileId || null,
        created_at: c.created_at || Date.now(),
        updated_at: Date.now(),
      }))
      await saveCharacters(id, chars)

      // 并行处理所有角色的 sprites（清理 + 保存）
      await Promise.all(body.characters.map(async (c: any) => {
        const { data: oldSprites } = await listSprites(c.id)
        const oldIds = new Set((oldSprites || []).map((s: any) => s.id))
        const newIds = new Set((c.sprites || []).map((s: any) => s.id))
        // 后台清理被移除的立绘文件（不阻塞）
        for (const os of (oldSprites || [])) {
          if (!newIds.has(os.id) && os.url) {
            deleteFromStorage(os.url).catch(() => {})
          }
        }

        await saveSprites(c.id, (c.sprites || []).map((s: any) => ({
          id: s.id,
          character_id: c.id,
          name: s.name || '',
          type: s.type || 'base',
          frame_type: s.frameType || null,
          url: s.url || '',
          tags: JSON.stringify(s.tags || []),
          sort_order: 0,
        })))
      }))
    }

    // 保存元数据
    if (body.meta) {
      await updateProject(id, { ...body.meta, updated_at: Date.now() })
    }

    // 版本号 +1 返回给客户端
    const newVersion = (body.version || 1) + 1
    return NextResponse.json({ success: true, data: { version: newVersion } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "保存失败" }, { status: 500 })
  }
}
