/**
 * GET /api/projects/[id]/full   — 加载项目全部数据
 * PATCH /api/projects/[id]/full — 保存章节和结局
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  getProject, listChapters, listEndings, listKeyPoints,
  listCharacters, listSpriteCombos, listSprites,
  saveChapters, saveEndings, updateProject,
  saveSubSections, saveKeyPoints, saveCharacters, saveSpriteCombos,
  saveSprites,
} from "@/lib/project-store"

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

  const [projRes, chRes, endRes] = await Promise.all([
    getProject(id),
    listChapters(id),
    listEndings(id),
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
        scenes: typeof ch.scenes === 'string' ? JSON.parse(ch.scenes) : (ch.scenes || []),
        endingType: ch.ending_type,
        branchFrom: ch.branch_from,
        keyPoints: (kps || []).map((kp: any) => ({
          id: kp.id,
          text: kp.text,
          description: kp.description,
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

  return NextResponse.json({
    success: true,
    data: {
      project: projRes.data,
      chapters: chaptersWithKeyPoints,
      endings: endRes.data || [],
      characters: (charList || []).map((c: any) => ({
        ...c,
        sprites: c.sprites || [],
        appearance: typeof c.appearance === 'string' ? JSON.parse(c.appearance || '[]') : (c.appearance || []),
        temperament: typeof c.temperament === 'string' ? JSON.parse(c.temperament || '[]') : (c.temperament || []),
        extraDescription: c.extra_description,
      })),
      sprite_combos: spriteCombos,
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
        scenes: JSON.stringify(ch.scenes || []),
        route: ch.route || 'common',
        ending_type: ch.endingType || null,
        branch_from: ch.branchFrom || null,
        sort_order: ch.sort_order ?? ch.number,
        created_at: ch.created_at || Date.now(),
        updated_at: Date.now(),
      }))
      await saveChapters(id, chapters)

      // 提取 key_points 保存到独立表（先清后插，覆盖旧数据）
      for (const ch of body.chapters) {
        await saveKeyPoints(ch.id, (ch.keyPoints || []).map((kp: any, i: number) => ({
          id: kp.id,
          chapter_id: ch.id,
          text: kp.text || '',
          description: kp.description || null,
          sort_order: i,
        })))
      }
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
          background: sub.background || '',
          bgm: sub.bgm || '',
          cg_trigger: sub.cgTrigger || null,
          transition: sub.transition || 'cut',
          is_branch: sub.isBranch ? 1 : 0,
          branch_from: sub.branchFrom || null,
          dialogues: typeof sub.dialogues === 'string' ? sub.dialogues : JSON.stringify(sub.dialogues || []),
          triggers: typeof sub.triggers === 'string' ? sub.triggers : JSON.stringify(sub.triggers || []),
          sort_order: sub.sort_order ?? 0,
        })
      }
      for (const [cid, subs] of Object.entries(byChapter)) {
        await saveSubSections(cid, subs)
      }
    }

    // 保存结局
    if (body.endings) {
      await saveEndings(id, body.endings)
    }

    // 保存立绘组合
    if (body.sprite_combos) {
      for (const [characterId, combos] of Object.entries(body.sprite_combos)) {
        if (Array.isArray(combos)) {
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
        }
      }
    }

    // 保存角色 + 立绘
    if (body.characters) {
      const chars = body.characters.map((c: any) => ({
        id: c.id,
        project_id: id,
        name: c.name || '',
        color: c.color || '#ec4899',
        avatar: c.avatar || null,
        personality: c.personality || null,
        description: c.description || null,
        appearance: JSON.stringify(c.appearance || []),
        temperament: JSON.stringify(c.temperament || []),
        extra_description: c.extraDescription || null,
        sort_order: 0,
        created_at: c.created_at || Date.now(),
        updated_at: Date.now(),
      }))
      await saveCharacters(id, chars)

      // 提取 sprites 保存到独立表
      for (const c of body.characters) {
        if (c.sprites?.length) {
          await saveSprites(c.id, c.sprites.map((s: any) => ({
            id: s.id,
            character_id: c.id,
            name: s.name || '',
            type: s.type || 'base',
            frame_type: s.frameType || null,
            url: s.url || '',
            tags: JSON.stringify(s.tags || []),
            sort_order: 0,
          })))
        }
      }
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
