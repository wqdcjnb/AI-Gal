/**
 * POST /api/user/avatar — 上传用户头像
 *
 * CloudBase 云存储 API 文档：
 *   app.uploadFile({ cloudPath, fileContent }) → { fileID }
 *   app.getTempFileURL({ fileList: [fileID] })  → { fileList: [{ fileID, tempFileURL, code }] }
 *   app.deleteFile({ fileList: [fileID] })      → { fileList: [{ fileID, code }] }
 *
 * 流程：
 * 1. 验证登录 → 获取 uid
 * 2. 查找旧头像 fileId → 删除云存储中的旧文件
 * 3. 上传新文件到云存储 → 获取 fileID
 * 4. 获取临时访问 URL → 返回给客户端即时展示
 * 5. 更新 users 集合，持久化 fileID
 */

import { parseAccessToken } from "@/lib/auth/token"
import cloudbaseApp from "@/lib/cloudbase"
import { db } from "@/lib/cloudbase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { COLLECTIONS } from "@/lib/db-schema"

const COOKIE_NAME = "cloudbase_token"
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

/** 从 Cookie 解析 uid */
async function getUid(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  const parsed = parseAccessToken(token)
  return parsed?.uid ?? null
}

/** 删除云存储中的旧头像文件 */
async function deleteOldAvatar(fileId: string): Promise<void> {
  if (!fileId || !fileId.startsWith("cloud://")) return
  try {
    const result = await cloudbaseApp.deleteFile({ fileList: [fileId] })
    const status = result.fileList?.[0]
    if (status && status.code !== "SUCCESS") {
    }
  } catch (error) {
    // 删除失败不阻塞上传流程
  }
}

export async function POST(request: Request) {
  try {
    // ====== 1. 验证登录 ======
    const uid = await getUid()
    if (!uid) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    // ====== 2. 解析 FormData ======
    const formData = await request.formData()
    const file = formData.get("avatar") as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: "未选择文件" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "仅支持 PNG、JPG、WebP、GIF 格式" },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "图片大小不能超过 5MB" },
        { status: 400 }
      )
    }

    // ====== 3. 查找旧头像并删除 ======
    const userRes = await db
      .collection(COLLECTIONS.USERS)
      .where({ uid })
      .limit(1)
      .get()

    const oldFileId: string | undefined = userRes.data?.[0]?.avatarUrl
    if (oldFileId?.startsWith("cloud://")) {
      await deleteOldAvatar(oldFileId)
    }

    // ====== 4. 上传新文件到云存储 ======
    const ext = file.type.split("/")[1] || "png"
    const cloudPath = `avatars/${uid}_${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadResult = await cloudbaseApp.uploadFile({
      cloudPath,
      fileContent: buffer,
    })

    if (!uploadResult.fileID) {
      return NextResponse.json(
        { success: false, message: "上传到云存储失败" },
        { status: 500 }
      )
    }

    const newFileId = uploadResult.fileID

    // ====== 5. 获取临时访问 URL ======
    const urlResult = await cloudbaseApp.getTempFileURL({
      fileList: [newFileId],
    })

    const fileUrlInfo = urlResult.fileList?.[0]
    if (!fileUrlInfo || fileUrlInfo.code !== "SUCCESS") {
      return NextResponse.json(
        { success: false, message: "获取头像访问链接失败" },
        { status: 500 }
      )
    }

    const avatarUrl = fileUrlInfo.tempFileURL

    // ====== 6. 更新 users 集合（存储 fileId，而非临时 URL） ======
    if (userRes.data?.[0]) {
      await db
        .collection(COLLECTIONS.USERS)
        .doc(userRes.data[0]._id)
        .update({
          avatarUrl: newFileId, // 存 fileId，下次读取时重新获取临时 URL
          updatedAt: Date.now(),
        })
    }

    // ====== 7. 返回结果 ======
    return NextResponse.json({
      success: true,
      data: {
        avatarUrl,  // 临时 URL，客户端即时展示
        fileId: newFileId,
      },
      message: "头像上传成功",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "头像上传失败，请稍后重试" },
      { status: 500 }
    )
  }
}
