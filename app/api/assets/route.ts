/**
 * GET    /api/assets?projectId=xxx&category=xxx
 * POST   /api/assets — 创建素材记录
 * DELETE /api/assets?id=xxx — 删除素材
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { listAssets, createAsset, updateAsset, deleteAsset, getAsset } from "@/lib/db/project-store"
import { deleteFromStorage } from "@/lib/storage/pg-storage"
import type { AssetRow } from "@/lib/db/project-store"

const COOKIE_NAME = "cloudbase_token"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")
  const category = searchParams.get("category") || undefined
  if (!projectId) return NextResponse.json({ success: false, message: "缺少 projectId" }, { status: 400 })

  try {
    const { data, error } = await listAssets(projectId, category)
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  if (!parsed?.uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  try {
    const body = await request.json()
    const { projectId, name, category, url, size } = body
    if (!projectId || !name || !category || !url) {
      return NextResponse.json({ success: false, message: "缺少必填字段" }, { status: 400 })
    }

    const row: AssetRow = {
      id: `ast-${Date.now()}`,
      project_id: projectId,
      name,
      category,
      url,
      created_at: Date.now(),
    }

    const { error } = await createAsset(row)
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })

    return NextResponse.json({ success: true, data: { ...row, size: size || 0 } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  try {
    const body = await request.json()
    const { id, ...fields } = body
    if (!id) return NextResponse.json({ success: false, message: "缺少 id" }, { status: 400 })

    const { error } = await updateAsset(id, fields)
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ success: false, message: "缺少 id" }, { status: 400 })

  try {
    // 先查 URL，删存储文件，再删 DB 记录
    const { data: asset } = await getAsset(id)
    if (asset?.url) await deleteFromStorage(asset.url)
    const { error } = await deleteAsset(id)
    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
