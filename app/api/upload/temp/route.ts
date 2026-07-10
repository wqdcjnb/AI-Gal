/**
 * POST /api/upload/temp
 * 上传 base64 图片/音频到 CloudBase 云存储，返回临时访问 URL
 * Body: { image: "data:image/png;base64,..." }
 */
import app from "@/lib/cloudbase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ success: false, message: "请提供文件数据" }, { status: 400 });
    }

    // 从 base64 data URL 提取纯 base64 和 mime 类型（支持 image/ 和 audio/）
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    const mime = matches?.[1] || "image/png";
    const pure = matches?.[2] || image;
    const extMap: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "audio/mpeg": "mp3", "audio/wav": "wav", "audio/ogg": "ogg", "audio/mp4": "m4a" };
    const ext = extMap[mime] || mime.split("/")[1] || "bin";
    const buffer = Buffer.from(pure, "base64");

    // 上传到 CloudBase 云存储
    const cloudPath = `temp/ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const uploadResult = await app.uploadFile({
      cloudPath,
      fileContent: buffer,
    });

    // 获取临时访问 URL（有效期 2 小时）
    const urlResult = await app.getTempFileURL({
      fileList: [uploadResult.fileID],
    });
    const tempUrl = urlResult.fileList?.[0]?.tempFileURL || "";

    return NextResponse.json({ success: true, url: tempUrl, fileId: uploadResult.fileID });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "上传失败" }, { status: 500 });
  }
}
