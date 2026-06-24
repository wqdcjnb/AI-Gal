/**
 * POST /api/ai/image
 * 文生图 / 图生图 — 万相 2.7 (wan2.7-image-pro)
 * Body: { prompt, size?, n?, type?, referenceImage? }
 */
import { generateImage } from "@/lib/ai/qwen";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, size, n, type, referenceImage } = await request.json();
    if (!prompt) {
      return NextResponse.json({ success: false, message: "请提供图片描述" }, { status: 400 });
    }

    const typeSuffix: Record<string, string> = {
      character:
        "full body character sprite sheet, standing pose, transparent background, " +
        "clean cutout with no background elements, PNG format with alpha channel, " +
        "front-facing, evenly lit, suitable for visual novel sprite",
      background:
        "background art, wide shot, detailed environment, no characters, " +
        "suitable for visual novel background scene",
      cg:
        "event CG illustration, cinematic composition, dramatic lighting, " +
        "visual novel key art, high detail, emotional atmosphere",
    };

    const extra = type && typeSuffix[type] ? `, ${typeSuffix[type]}` : "";
    const animePrompt = `${prompt}${extra}`;

    const images = await generateImage({
      prompt: animePrompt,
      size: size || "2K",
      n: n || 4,
      referenceImage,
    });

    return NextResponse.json({ success: true, images });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
