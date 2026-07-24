/**
 * POST /api/projects/cover — 上传项目封面，自动清理旧图
 */
import { handleImageUpload } from "@/lib/storage/image-upload"
import { deleteFromStorage } from "@/lib/storage/pg-storage"
import { getProject } from "@/lib/db/project-store"
import { parseAccessToken } from "@/lib/auth/token"
import { cookies } from "next/headers"

const COOKIE_NAME = "cloudbase_token"

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const parsed = token ? parseAccessToken(token) : null

  // 一次性读取 formData（不 clone，避免 multipart body 不可靠）
  const formData = await request.formData()
  const projectId = formData.get("projectId") as string

  // 查旧封面 URL
  let oldCoverUrl: string | null = null
  if (parsed?.uid && projectId) {
    try {
      const { data } = await getProject(projectId)
      oldCoverUrl = data?.cover_url || null
    } catch {}
  }

  // 传 FormData 给 handleImageUpload（它接受 Request | FormData）
  const uploadResponse = await handleImageUpload("covers", formData)

  // 上传成功后后台清理旧文件（不阻塞响应）
  if (uploadResponse.status === 200 && oldCoverUrl) {
    deleteFromStorage(oldCoverUrl).catch(e => console.error("清理封面失败:", e))
  }

  return uploadResponse
}
