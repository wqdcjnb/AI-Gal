/**
 * POST /api/ai/bgm
 * 根据文字描述生成 BGM（MusicGen）
 * Body: { prompt, duration? }
 * 返回: 音频 blob（WAV 格式）
 */
import { generateMusic } from "@/lib/ai/musicgen";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, duration } = await request.json();
    if (!prompt) {
      return NextResponse.json({ success: false, message: "请提供音乐描述" }, { status: 400 });
    }

    const audioBuffer = await generateMusic({ prompt, duration });

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'inline; filename="bgm.wav"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
