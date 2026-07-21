/**
 * POST /api/projects/cover — 上传项目封面到 CloudBase PG 云存储
 */
import { handleImageUpload } from "@/lib/storage/image-upload"

export async function POST(request: Request) {
  return handleImageUpload("covers", request)
}
