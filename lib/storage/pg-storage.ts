/**
 * CloudBase 云存储上传
 *
 * 用 node-sdk uploadFile 上传到 COS，返回 CDN 永久 URL
 */
import cloudbaseApp from "../cloudbase/cloudbase"

/**
 * cloud:// fileID → CDN 永久 URL
 * cloud://{envId}.{bucketId}/{path} → https://{bucketId}.tcb.qcloud.la/{path}
 */
export function toCdnUrl(fileID: string): string {
  const withoutProtocol = fileID.slice("cloud://".length)
  const dotIdx = withoutProtocol.indexOf(".")
  const slashIdx = withoutProtocol.indexOf("/", dotIdx)
  const bucketId = withoutProtocol.slice(dotIdx + 1, slashIdx)
  const filePath = withoutProtocol.slice(slashIdx + 1)
  return `https://${bucketId}.tcb.qcloud.la/${filePath}`
}

/**
 * CDN URL → cloud://fileID（用于删除旧文件）
 * 兼容 tcb.qcloud.la 和 cos.*.myqcloud.com 两种域名
 */
function cdnUrlToFileId(cdnUrl: string): string | null {
  // tcb.qcloud.la 格式
  let match = cdnUrl.match(/https:\/\/(.+)\.tcb\.qcloud\.la\/(.+)/)
  if (match) {
    return `cloud://${process.env.CLOUDBASE_ENV_ID}.${match[1]}/${match[2]}`
  }
  // COS 域名格式: https://{bucket}.cos.{region}.myqcloud.com/{path}
  match = cdnUrl.match(/https:\/\/(.+)\.cos\.(.+)\.myqcloud\.com\/(.+)/)
  if (match) {
    return `cloud://${process.env.CLOUDBASE_ENV_ID}.${match[1]}/${match[3]}`
  }
  return null
}

/** 删除云存储文件 */
export async function deleteFromStorage(fileIdOrUrl: string) {
  const fileID = fileIdOrUrl.startsWith("cloud://") ? fileIdOrUrl : cdnUrlToFileId(fileIdOrUrl)
  if (!fileID) return
  try {
    await cloudbaseApp.deleteFile({ fileList: [fileID] })
  } catch (e: any) {
    console.error("删除旧文件失败:", e?.message || e)
  }
}

export async function uploadToPGStorage(params: {
  cloudPath: string
  fileContent: Buffer
  bucketId: string
  mimeType: string
  ownerId: string
}): Promise<{ cdnUrl: string } | null> {
  const { cloudPath, fileContent } = params

  const uploadResult = await cloudbaseApp.uploadFile({ cloudPath, fileContent })
  if (!uploadResult.fileID) return null

  // 优先用 SDK 返回的直接 URL，否则用 fileID 拼接
  const cdnUrl = (uploadResult as any).downloadUrl || (uploadResult as any).url || toCdnUrl(uploadResult.fileID)
  return { cdnUrl }
}
