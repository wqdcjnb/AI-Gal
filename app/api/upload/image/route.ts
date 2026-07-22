/**
 * POST /api/upload/image — 通用图片上传到 CloudBase 云存储
 * @param file   — 图片文件
 * @param folder — 存储目录: avatars | covers | characters | sprites
 * @returns { cdnUrl } CDN 永久 URL
 */
import { handleImageUpload, type ImageFolder } from "@/lib/storage/image-upload"
import { NextResponse } from "next/server"

const ALLOWED_FOLDERS: ImageFolder[] = ["avatars", "covers", "characters", "sprites"]

export async function POST(request: Request) {
  const formData = await request.formData()
  let folder = (formData.get("folder") as string) || "covers"
  if (!ALLOWED_FOLDERS.includes(folder as ImageFolder)) folder = "covers"

  return handleImageUpload(folder as ImageFolder, formData)
}
