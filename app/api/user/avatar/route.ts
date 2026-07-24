/**
 * POST /api/user/avatar — 上传用户头像
 * 图片存入 CloudBase 云存储，数据库存 CDN 永久 URL
 */
import { handleImageUpload } from "@/lib/storage/image-upload"
import { deleteFromStorage } from "@/lib/storage/pg-storage"
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getUser, createUser, updateUser } from "@/lib/db/user-store"

const COOKIE_NAME = "cloudbase_token"

export async function POST(request: Request) {
  // 先拿到 uid（handleImageUpload 也会做 auth，但我们需要 uid 写 DB）
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const parsed = token ? parseAccessToken(token) : null
  const uid = parsed?.uid

  // 上传图片（内含 auth 校验）
  const uploadResponse = await handleImageUpload("avatars", request)
  if (uploadResponse.status !== 200) return uploadResponse

  // 写 DB
  if (uid) {
    try {
      const json: any = await uploadResponse.json()
      const cdnUrl = json?.data?.cdnUrl
      if (cdnUrl) {
        // 删除旧头像
        const prev = await getUser(uid)
        if (prev?.avatar_url) deleteFromStorage(prev.avatar_url).catch(e => console.error("清理头像失败:", e))
        const email = parsed?.email || uid
        if (!prev) await createUser(uid, email)
        await updateUser(uid, { avatar_url: cdnUrl })
        return NextResponse.json({ success: true, data: { avatarUrl: cdnUrl } })
      }
    } catch { /* 上传成功但 DB 写入失败，仍返回上传结果 */ }
  }

  return uploadResponse
}
