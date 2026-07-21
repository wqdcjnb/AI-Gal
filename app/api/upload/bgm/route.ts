/**
 * POST /api/upload/bgm — 上传 BGM 音频
 */
import { handleAssetUpload, ASSET_CONFIGS } from "@/lib/storage/asset-upload"

export async function POST(request: Request) {
  return handleAssetUpload(ASSET_CONFIGS.bgm, request)
}
