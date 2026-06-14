/**
 * GET  /api/user/profile  — 获取当前用户的扩展信息（昵称等）
 * PATCH /api/user/profile — 更新当前用户的昵称
 *
 * 依赖 CloudBase Auth Cookie 中的 access_token 来识别用户身份
 */

import { db, default as app } from "@/lib/cloudbase"
import { parseAccessToken } from "@/lib/cloudbase-auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COLLECTIONS } from "@/lib/db-schema"

const COOKIE_NAME = "cloudbase_token"

/** 将 CloudBase fileId 解析为临时访问 URL */
async function resolveAvatarUrl(fileId: string | undefined): Promise<string> {
  if (!fileId || !fileId.startsWith("cloud://")) return fileId || ""
  try {
    const result = await app.getTempFileURL({ fileList: [fileId] })
    return result.fileList?.[0]?.tempFileURL || fileId
  } catch {
    return fileId // 解析失败返回原始 fileId
  }
}

/** 从 Cookie 中解析当前用户 uid */
async function getCurrentUid(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const user = parseAccessToken(token)
  return user?.uid ?? null
}

/** 根据 uid 读取用户文档（不存在返回 null） */
async function getUserDoc(uid: string) {
  const res = await db
    .collection(COLLECTIONS.USERS)
    .where({ uid })
    .limit(1)
    .get()
  return res.data?.[0] ?? null
}

/** 创建用户文档（注册后首次访问个人中心时） */
async function createUserDoc(uid: string, email: string) {
  const doc = {
    uid,
    email,
    nickname: email.split("@")[0] || email,
    avatarUrl: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const res = await db.collection(COLLECTIONS.USERS).add(doc)
  return { _id: res.id, ...doc }
}

// ============================================================
// GET — 读取用户扩展信息
// ============================================================

export async function GET() {
  try {
    const uid = await getCurrentUid()
    if (!uid) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    let userDoc = await getUserDoc(uid)

    // 首次访问：自动创建用户文档
    if (!userDoc) {
      // 从 token 解析 email
      const cookieStore = await cookies()
      const token = cookieStore.get(COOKIE_NAME)?.value || ""
      const parsed = token ? parseAccessToken(token) : null
      const email = parsed?.email || uid
      userDoc = await createUserDoc(uid, email)
    }

    const resolvedAvatar = await resolveAvatarUrl(userDoc.avatarUrl)

    return NextResponse.json({
      success: true,
      data: {
        nickname: userDoc.nickname,
        avatarUrl: resolvedAvatar,
        email: userDoc.email,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "获取用户信息失败" },
      { status: 500 }
    )
  }
}

// ============================================================
// PATCH — 更新用户昵称
// ============================================================

export async function PATCH(request: Request) {
  try {
    const uid = await getCurrentUid()
    if (!uid) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { nickname } = body

    if (!nickname || typeof nickname !== "string") {
      return NextResponse.json(
        { success: false, message: "昵称不能为空" },
        { status: 400 }
      )
    }

    const trimmed = nickname.trim()
    if (trimmed.length === 0 || trimmed.length > 30) {
      return NextResponse.json(
        { success: false, message: "昵称长度需在 1-30 个字符之间" },
        { status: 400 }
      )
    }

    // 查找用户文档
    const existingDoc = await getUserDoc(uid)
    if (!existingDoc) {
      return NextResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      )
    }

    // 更新昵称
    await db
      .collection(COLLECTIONS.USERS)
      .doc(existingDoc._id)
      .update({
        nickname: trimmed,
        updatedAt: Date.now(),
      })

    return NextResponse.json({
      success: true,
      message: "昵称已更新",
      data: { nickname: trimmed },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "更新昵称失败，请稍后重试" },
      { status: 500 }
    )
  }
}
