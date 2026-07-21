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

  return { cdnUrl: toCdnUrl(uploadResult.fileID) }
}
