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
} from "@/lib/project-store"

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

  return NextResponse.json({ success: true, data })
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
      emotion_style: body.emotion_style || "恋爱喜剧",
      theme_background: body.theme_background || "校园",
      narrative_structure: body.narrative_structure || "分支叙事",
      synopsis: body.synopsis || "",
      chapter_count: body.chapter_count ?? 6,
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
    if (rest.chapter_count !== undefined) fields.chapter_count = rest.chapter_count
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

  const { error } = await deleteProject(id)
  if (error) return NextResponse.json({ success: false, message: "删除失败" }, { status: 500 })

  return NextResponse.json({ success: true })
}
