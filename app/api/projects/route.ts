/**
 * GET    /api/projects       — 获取用户的项目列表
 * POST   /api/projects       — 创建新项目
 * PATCH  /api/projects       — 更新项目设置
 * DELETE /api/projects?id=x  — 删除项目（CASCADE 清理关联数据）
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  listProjects,
  createProject,
  updateProject,
  deleteProject,
  listChapters,
  listCharacters,
  getProject,
  listSprites,
  listSpriteCombos,
  listAssets,
} from "@/lib/db/project-store"
import { rdb } from "@/lib/cloudbase/cloudbase"
import { deleteFromStorage } from "@/lib/storage/pg-storage"

const COOKIE_NAME = "cloudbase_token"

async function getUid(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return parseAccessToken(token)?.uid ?? null
}

// ============================================================
// GET — 项目列表
// ============================================================
export async function GET() {
  const uid = await getUid()
  if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { data, error } = await listProjects(uid)
  if (error) {
    return NextResponse.json({ success: false, message: "查询失败" }, { status: 500 })
  }

  // 补充每个项目的角色数量和路线数量
  const enriched = await Promise.all((data || []).map(async (p: any) => {
    const [chRes, charRes] = await Promise.all([
      listChapters(p.id),
      listCharacters(p.id),
    ])
    const chapters = chRes.data || []
    const routeSet = new Set(chapters.filter((c: any) => c.route !== 'common').map((c: any) => c.route))
    return {
      ...p,
      chapterCount: chapters.length,
      characterCount: (charRes.data || []).length,
      routeCount: routeSet.size,
    }
  }))

  return NextResponse.json({ success: true, data: enriched })
}

// ============================================================
// POST — 创建项目
// ============================================================
export async function POST(request: Request) {
  const uid = await getUid()
  if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  try {
    const body = await request.json()
    const name = body.name?.trim()
    if (!name) {
      return NextResponse.json({ success: false, message: "项目名称不能为空" }, { status: 400 })
    }

    const now = Date.now()
    const id = `${now}`

    const { error } = await createProject({
      id,
      user_id: uid,
      name,
      emotion_style: body.emotion_style,
      theme_background: body.theme_background,
      narrative_structure: body.narrative_structure,
      synopsis: body.synopsis || "",
      cover_url: body.cover_url ?? null,
      status: "editing",
      created_at: now,
      updated_at: now,
    })

    if (error) {
      return NextResponse.json({ success: false, message: "创建失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { id, name } }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "请求格式错误" }, { status: 400 })
  }
}

// ============================================================
// PATCH — 更新项目设置
// ============================================================
export async function PATCH(request: Request) {
  const uid = await getUid()
  if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...rest } = body
    if (!id) return NextResponse.json({ success: false, message: "缺少项目 ID" }, { status: 400 })

    const fields: Record<string, any> = {}
    if (rest.name) fields.name = rest.name.trim()
    if (rest.emotion_style) fields.emotion_style = rest.emotion_style
    if (rest.theme_background) fields.theme_background = rest.theme_background
    if (rest.narrative_structure) fields.narrative_structure = rest.narrative_structure
    if (rest.synopsis !== undefined) fields.synopsis = rest.synopsis
    if (rest.cover_url !== undefined) fields.cover_url = rest.cover_url
    if (rest.status) fields.status = rest.status

    const { error } = await updateProject(id, fields as any)
    if (error) return NextResponse.json({ success: false, message: "更新失败" }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, message: "请求格式错误" }, { status: 400 })
  }
}

// ============================================================
// DELETE — 删除项目
// ============================================================
export async function DELETE(request: Request) {
  const uid = await getUid()
  if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ success: false, message: "缺少项目 ID" }, { status: 400 })

  // 删 DB 前收集所有关联文件 URL，清理云存储
  try {
    const [projRes, assetRes, charRes] = await Promise.all([
      getProject(id),
      listAssets(id),
      listCharacters(id),
    ])
    const urls: string[] = []

    // 项目封面
    if (projRes.data?.cover_url) urls.push(projRes.data.cover_url)

    // 素材文件
    for (const a of (assetRes.data || [])) {
      if ((a as any).url) urls.push((a as any).url)
    }

    // 角色立绘 + 立绘组合
    for (const ch of (charRes.data || [])) {
      const { data: sprites } = await listSprites(ch.id)
      for (const s of (sprites || [])) {
        if ((s as any).url) urls.push((s as any).url)
      }
      const { data: combos } = await listSpriteCombos(ch.id)
      for (const cm of (combos || [])) {
        if ((cm as any).url) urls.push((cm as any).url)
      }
    }

    // 语音参考音频 + 生成音频
    const { data: voiceProfiles } = await rdb.from("voice_profiles").select("ref_audio_url").eq("project_id", id)
    for (const vp of (voiceProfiles || [])) {
      if ((vp as any).ref_audio_url) urls.push((vp as any).ref_audio_url)
    }
    const { data: generations } = await rdb.from("voice_generations").select("audio_url").eq("project_id", id)
    for (const g of (generations || [])) {
      if ((g as any).audio_url) urls.push((g as any).audio_url)
    }

    // 批量删云存储文件
    await Promise.all(urls.map(u => deleteFromStorage(u)))
  } catch (e) {
    console.error("清理存储文件失败:", e)
    // 不阻塞删除，继续删 DB
  }

  const { error } = await deleteProject(id)
  if (error) return NextResponse.json({ success: false, message: "删除失败" }, { status: 500 })

  return NextResponse.json({ success: true })
}
