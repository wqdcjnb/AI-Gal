/**
 * POST /api/upload/temp
 * 上传 base64 图片到 CloudBase 云存储，返回临时访问 URL
 * Body: { image: "data:image/png;base64,..." }
 */
import app from "@/lib/cloudbase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    if (!image) {
      return NextResponse.json({ success: false, message: "请提供图片数据" }, { status: 400 });
    }

    // 从 base64 data URL 提取纯 base64 和 mime 类型
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    const mime = matches?.[1] || "image/png";
    const pure = matches?.[2] || image;
    const ext = mime.split("/")[1] || "png";
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
