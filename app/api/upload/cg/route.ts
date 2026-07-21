/**
 * POST /api/upload/cg — 上传 CG 图片
 */
import { handleAssetUpload, ASSET_CONFIGS } from "@/lib/storage/asset-upload"

export async function POST(request: Request) {
  return handleAssetUpload(ASSET_CONFIGS.cg, request)
}
