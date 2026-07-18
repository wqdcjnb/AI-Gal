/**
 * GET  /api/user/profile  — 获取当前用户信息
 * PATCH /api/user/profile — 更新昵称
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getUser, createUser, updateUser } from "@/lib/user-store"

const COOKIE_NAME = "cloudbase_token"

async function getCurrentUid(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return parseAccessToken(token)?.uid ?? null
}

// GET
export async function GET() {
  try {
    const uid = await getCurrentUid()
    if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value || ""
    const parsed = token ? parseAccessToken(token) : null
    const email = parsed?.email || uid

    let user = await getUser(uid)
    if (!user) user = await createUser(uid, email)

    const avatarUrl = user.avatar_url || ""

    return NextResponse.json({
      success: true,
      data: {
        nickname: user.nickname,
        avatarUrl,
        email: user.email,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "获取失败" }, { status: 500 })
  }
}

// PATCH
export async function PATCH(request: Request) {
  try {
    const uid = await getCurrentUid()
    if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

    const { nickname } = await request.json()
    if (!nickname || typeof nickname !== "string" || nickname.trim().length > 30) {
      return NextResponse.json({ success: false, message: "昵称需 1-30 字符" }, { status: 400 })
    }

    let user = await getUser(uid)
    if (!user) {
      const cookieStore = await cookies()
      const parsed = parseAccessToken(cookieStore.get(COOKIE_NAME)?.value || "")
      user = await createUser(uid, parsed?.email || uid)
    }

    const updated = await updateUser(uid, { nickname: nickname.trim() })
    return NextResponse.json({ success: true, data: { nickname: updated?.nickname } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "更新失败" }, { status: 500 })
  }
}
