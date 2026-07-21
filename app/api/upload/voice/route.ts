/**
 * POST /api/upload/voice — 上传语音
 */
import { handleAssetUpload, ASSET_CONFIGS } from "@/lib/storage/asset-upload"

export async function POST(request: Request) {
  return handleAssetUpload(ASSET_CONFIGS.voice, request)
}
