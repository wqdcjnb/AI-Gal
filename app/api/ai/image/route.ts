/**
 * POST /api/ai/image
 * 根据文字描述生成图片（通义万相 2.5）
 * Body: { prompt, size?, n? }
 */
import { generateImage } from "@/lib/ai/qwen";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, size, n } = await request.json();
    if (!prompt) {
      return NextResponse.json({ success: false, message: "请提供图片描述" }, { status: 400 });
    }

    // 强制二次元风格
    const animePrompt = `anime style, 2D illustration, Galgame visual novel art, ${prompt}`;
    const images = await generateImage({ prompt: animePrompt, size, n });

    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
