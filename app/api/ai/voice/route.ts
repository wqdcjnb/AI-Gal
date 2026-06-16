/**
 * POST /api/ai/voice
 * 角色配音 — 支持音色设计 / 音色克隆 / 文字转语音
 *
 * action=design:  { action: "design", prompt, previewText, name }
 * action=clone:   { action: "clone", audioBase64, name }
 * action=speak:   { action: "speak", text, voiceName }
 */
import { designVoice, cloneVoice, textToSpeech } from "@/lib/ai/qwen";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "design") {
      const { prompt, previewText, name } = body;
      if (!prompt || !name) return NextResponse.json({ success: false, message: "请提供音色描述和名称" }, { status: 400 });
      const result = await designVoice({ prompt, previewText: previewText || "你好，这是我的声音。", name });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "clone") {
      const { audioBase64, name } = body;
      if (!audioBase64 || !name) return NextResponse.json({ success: false, message: "请提供音频样本和名称" }, { status: 400 });
      const result = await cloneVoice({ audioBase64, name });
      return NextResponse.json({ success: true, ...result });
    }

    if (action === "speak") {
      const { text, voiceName } = body;
      if (!text || !voiceName) return NextResponse.json({ success: false, message: "请提供文本和音色名称" }, { status: 400 });
      const audio = await textToSpeech({ text, voiceName });
      return NextResponse.json({ success: true, audio });
    }

    return NextResponse.json({ success: false, message: "无效 action，支持: design | clone | speak" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "操作失败" }, { status: 500 });
  }
}
