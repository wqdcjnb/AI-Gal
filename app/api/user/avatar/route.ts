/**
 * POST /api/user/avatar — 上传用户头像
 * 图片存入 CloudBase 云存储，数据库存 CDN 永久 URL
 */
import { uploadToPGStorage } from "@/lib/storage/pg-storage"
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getUser, createUser, updateUser } from "@/lib/db/user-store"

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
    const ext = file.type.split("/")[1] || "png"
    const cloudPath = `${uid}_${Date.now()}.${ext}`

    const result = await uploadToPGStorage({
      cloudPath,
      fileContent: buffer,
      bucketId: "avatars",
      mimeType: file.type || "image/png",
      ownerId: uid,
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "上传失败" }, { status: 500 })
    }

    const email = parsed?.email || uid
    if (!await getUser(uid)) await createUser(uid, email)
    await updateUser(uid, { avatar_url: result.cdnUrl })

    return NextResponse.json({ success: true, data: { avatarUrl: result.cdnUrl } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "上传失败" }, { status: 500 })
  }
}
