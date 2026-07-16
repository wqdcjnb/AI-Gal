/**
 * POST /api/user/avatar — 上传用户头像
 */
import cloudbaseApp from "@/lib/cloudbase"
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getUser, createUser, updateUser } from "@/lib/user-store"

const COOKIE_NAME = "cloudbase_token"
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

    const parsed = parseAccessToken(token)
    const uid = parsed?.uid
    if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("avatar") as File | null
    if (!file) return NextResponse.json({ success: false, message: "未选择文件" }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, message: "图片不能超过 5MB" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    // Try CloudBase storage, fallback to base64
    let avatarUrl = ''
    try {
      const ext = file.type.split("/")[1] || "png"
      const cloudPath = `avatars/${uid}_${Date.now()}.${ext}`
      const uploadResult = await cloudbaseApp.uploadFile({ cloudPath, fileContent: buffer })
      if (uploadResult.fileID) {
        const urlResult = await cloudbaseApp.getTempFileURL({ fileList: [uploadResult.fileID] })
        avatarUrl = urlResult.fileList?.[0]?.tempFileURL || ''
      }
    } catch {
      // Fallback: base64 data URL
      const mime = file.type || "image/png"
      avatarUrl = `data:${mime};base64,${buffer.toString("base64")}`
    }

    if (!avatarUrl) {
      return NextResponse.json({ success: false, message: "上传失败" }, { status: 500 })
    }

    const email = parsed?.email || uid
    if (!getUser(uid)) createUser(uid, email)
    updateUser(uid, { avatar_url: avatarUrl })

    return NextResponse.json({ success: true, data: { avatarUrl } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "上传失败" }, { status: 500 })
  }
}
