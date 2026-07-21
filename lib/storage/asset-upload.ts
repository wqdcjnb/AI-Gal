/**
 * 素材上传共享逻辑
 * 所有素材统一存入 bucketId="assets"，cloudPath 前缀区分类别
 */
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { uploadToPGStorage } from "@/lib/storage/pg-storage"

const COOKIE_NAME = "cloudbase_token"
const MAX_SIZE = 5 * 1024 * 1024 // 5MB，和图片上传保持一致
const BUCKET_ID = "assets"

interface AssetConfig {
  category: string       // 类别标识：background | cg | bgm | se | voice
  label: string           // 中文名
  acceptMime: string[]    // 允许的 MIME
  maxSize?: number
}

export const ASSET_CONFIGS: Record<string, AssetConfig> = {
  background: {
    category: "background",
    label: "背景",
    acceptMime: ["image/png", "image/jpeg", "image/webp"],
  },
  cg: {
    category: "cg",
    label: "CG",
    acceptMime: ["image/png", "image/jpeg", "image/webp"],
  },
  bgm: {
    category: "bgm",
    label: "BGM",
    acceptMime: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/flac"],
  },
  se: {
    category: "se",
    label: "音效",
    acceptMime: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/flac"],
  },
  voice: {
    category: "voice",
    label: "语音",
    acceptMime: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/flac"],
  },
}

export async function handleAssetUpload(config: AssetConfig, request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const parsed = parseAccessToken(token)
  if (!parsed?.uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })

  const maxSize = config.maxSize || MAX_SIZE

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) return NextResponse.json({ success: false, message: "未选择文件" }, { status: 400 })
    if (file.size > maxSize) return NextResponse.json({ success: false, message: `${config.label}不能超过 ${maxSize / 1024 / 1024}MB` }, { status: 400 })
    if (!config.acceptMime.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: `${config.label}仅支持 ${config.acceptMime.map(m => m.split("/")[1]).join("、")} 格式`,
      }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split(".").pop() || file.type.split("/")[1] || "bin"
    const cloudPath = `${config.category}/${parsed.uid}_${Date.now()}.${ext}`

    const result = await uploadToPGStorage({
      cloudPath,
      fileContent: buffer,
      bucketId: BUCKET_ID,
      mimeType: file.type,
      ownerId: parsed.uid,
    })

    if (!result) {
      return NextResponse.json({ success: false, message: "上传失败" }, { status: 500 })
    }

    const name = (formData.get("name") as string) || file.name.replace(/\.[^.]+$/, "")

    return NextResponse.json({
      success: true,
      data: {
        cdnUrl: result.cdnUrl,
        name,
        mimeType: file.type,
        size: file.size,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e?.message || "上传失败" }, { status: 500 })
  }
}
