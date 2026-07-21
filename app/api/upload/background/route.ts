/**
 * POST /api/upload/background — 上传背景图片
 */
import { handleAssetUpload, ASSET_CONFIGS } from "@/lib/storage/asset-upload"

export async function POST(request: Request) {
  return handleAssetUpload(ASSET_CONFIGS.background, request)
}
