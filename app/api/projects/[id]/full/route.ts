/**
 * GET /api/projects/[id]/full — 一次性加载项目全部数据
 * 先从 PG 加载元数据，编辑器内容（章节/角色等）后续迁移后再接入
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getProject, listChapters, listEndings } from "@/lib/project-store"

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

  // 并行加载项目元数据
  const [projRes, chRes, endRes] = await Promise.all([
    getProject(id),
    listChapters(id),
    listEndings(id),
  ])

  if (!projRes.data) {
    return NextResponse.json({ success: false, message: "项目不存在" }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      project: projRes.data,
      chapters: chRes.data || [],
      endings: endRes.data || [],
    },
  })
}
