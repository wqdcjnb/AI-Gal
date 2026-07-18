/**
 * POST /api/projects/cover — 上传项目封面到 CloudBase PG 云存储
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { uploadToPGStorage } from "@/lib/pg-storage"

const COOKIE_NAME = "cloudbase_token"
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  if (!parsed?.uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get("cover") as File | null
    if (!file) return NextResponse.json({ success: false, message: "未选择文件" }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ success: false, message: "图片不能超过 5MB" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type.split("/")[1] || "png"
    const cloudPath = `covers/${parsed.uid}_${Date.now()}.${ext}`

    const result = await uploadToPGStorage({
      cloudPath,
      fileContent: buffer,
      bucketId: "covers",
      mimeType: file.type || "image/png",
      ownerId: parsed.uid,
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "上传失败" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { cdnUrl: result.cdnUrl },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "上传失败" }, { status: 500 })
  }
}
