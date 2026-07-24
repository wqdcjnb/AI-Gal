/**
 * 图片上传共享逻辑
 * 所有图片统一走 uploadToPGStorage，bucketId 区分类别
 *
 * 两层 API：
 *   uploadImage()      — 纯上传，返回 { cdnUrl }，调用方自行处理 DB
 *   handleImageUpload() — 完整 API handler，含 auth + 校验 + 上传，返回 NextResponse
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { uploadToPGStorage } from "@/lib/storage/pg-storage"

const COOKIE_NAME = "cloudbase_token"
const MAX_SIZE = 5 * 1024 * 1024

export const IMAGE_CONFIGS = {
  avatars:    { bucketId: "avatars",    label: "头像",     maxSize: MAX_SIZE },
  covers:     { bucketId: "covers",     label: "封面",     maxSize: MAX_SIZE },
  characters: { bucketId: "characters", label: "角色图片", maxSize: MAX_SIZE },
  sprites:    { bucketId: "sprites",    label: "立绘",     maxSize: MAX_SIZE },
} as const

export type ImageFolder = keyof typeof IMAGE_CONFIGS

/**
 * 纯上传逻辑 — 不含 HTTP auth/response，供需要额外 DB 操作的 route 使用
 */
export async function uploadImage(folder: ImageFolder, file: File): Promise<{ cdnUrl: string }> {
  const config = IMAGE_CONFIGS[folder]

  if (file.size > config.maxSize) {
    throw new Error(`${config.label}不能超过 ${config.maxSize / 1024 / 1024}MB`)
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("仅支持图片格式")
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.type.split("/")[1] || "png"
  const cloudPath = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

  const result = await uploadToPGStorage({
    cloudPath,
    fileContent: buffer,
    bucketId: config.bucketId,
    mimeType: file.type || "image/png",
    ownerId: "system",
  })

  if (!result) throw new Error("上传失败")
  return { cdnUrl: result.cdnUrl }
}

/**
 * 完整 API handler — auth + 校验 + 上传，返回 NextResponse
 * @param formData 可选：调用方已经读过 formData 时可传入，避免重复读取 Request body
 */
export async function handleImageUpload(folder: ImageFolder, requestOrFormData: Request | FormData): Promise<NextResponse> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  const uid = parsed?.uid
  if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const config = IMAGE_CONFIGS[folder]

  try {
    const formData = requestOrFormData instanceof FormData
      ? requestOrFormData
      : await (requestOrFormData as Request).formData()
    const file = (formData.get("file") || formData.get("cover") || formData.get("avatar")) as File | null

    if (!file) return NextResponse.json({ success: false, message: "未选择文件" }, { status: 400 })
    if (file.size > config.maxSize) {
      return NextResponse.json({ success: false, message: `${config.label}不能超过 ${config.maxSize / 1024 / 1024}MB` }, { status: 400 })
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, message: "仅支持图片格式" }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type.split("/")[1] || "png"
    const cloudPath = `${folder}/${uid}_${Date.now()}.${ext}`

    const result = await uploadToPGStorage({
      cloudPath,
      fileContent: buffer,
      bucketId: config.bucketId,
      mimeType: file.type || "image/png",
      ownerId: uid,
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "上传失败" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: { cdnUrl: result.cdnUrl } })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "上传失败" }, { status: 500 })
  }
}
