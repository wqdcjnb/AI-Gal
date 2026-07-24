import { NextRequest, NextResponse } from "next/server"
import { rdb } from "@/lib/cloudbase/cloudbase"

/**
 * 情绪 → instruction 映射
 * 龙安洋（longanyang）支持通过 instruction 控制情感
 */
const EMOTION_INSTRUCTION: Record<string, string> = {
  normal:    "你说话的情感是neutral。",
  happy:     "你说话的情感是happy。",
  sad:       "你说话的情感是sad。",
  angry:     "你说话的情感是angry。",
  surprised: "你说话的情感是surprised。",
  shy:       "你说话的情感是neutral。",
}

/** 支持 Instruct 的 CosyVoice 音色（其余音色传 instruction 会报错） */
const INSTRUCT_VOICES = new Set(["longanyang", "longanhuan_v3", "longhuhu_v3"])

/**
 * POST /api/voice/synthesize
 * 单句配音生成 — 调用 DashScope CosyVoice TTS API
 *
 * Body: { text, voiceProfileId, emotion?, speed?, volume?, language? }
 */
export async function POST(request: NextRequest) {
  try {
    const { text, voiceProfileId, emotion = "normal", speed = "normal", volume = 50, language = "zh" } = await request.json()

    if (!text || !voiceProfileId) {
      return NextResponse.json(
        { success: false, message: "缺少必要参数 text 或 voiceProfileId" },
        { status: 400 }
      )
    }

    // 1. 查声形配置（PostgreSQL）
    const { data: rows, error: profileErr } = await rdb
      .from("voice_profiles")
      .select("*")
      .eq("id", voiceProfileId)

    if (profileErr || !rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "声形未找到" }, { status: 404 })
    }

    const profile = rows[0] as any
    const ttsSpeakerId = profile.tts_speaker_id || "longanyang"
    const modelName = profile.model || "cosyvoice-v3-flash"

    // 2. 计算语速（DashScope rate: 0.5~2.0）
    const speedMap: Record<string, number> = { slow: 0.8, normal: 1.0, fast: 1.3 }
    const rate = speedMap[speed] || 1.0

    // 3. 构造 instruction（情感控制，仅支持 Instruct 的音色才生效）
    const instruction = EMOTION_INSTRUCTION[emotion] || EMOTION_INSTRUCTION.normal

    // 4. 语言提示（zh/ja/en）
    const languageHint = language === "zh" ? "zh" : language === "ja" ? "ja" : "en"

    // 5. 构造请求体 input
    const input: Record<string, any> = {
      text,
      voice: ttsSpeakerId,
      format: "mp3",
      sample_rate: 22050,
      volume,
      rate,
      language_hints: [languageHint],
    }
    // 仅当音色支持 Instruct 时添加情感控制指令
    if (INSTRUCT_VOICES.has(ttsSpeakerId)) {
      input.instruction = instruction
    }

    // 6. 调用 DashScope CosyVoice HTTP API
    const dashscopeKey = process.env.DASHSCOPE_VOICE_KEY
    if (!dashscopeKey) {
      return NextResponse.json(
        { success: false, message: "未配置 DASHSCOPE_VOICE_KEY" },
        { status: 500 }
      )
    }

    const ttsResponse = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/SpeechSynthesizer",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${dashscopeKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelName,
          input,
        }),
      }
    )

    const result = await ttsResponse.json()

    if (!ttsResponse.ok) {
      console.error("DashScope TTS API 错误:", JSON.stringify(result))
      return NextResponse.json(
        { success: false, message: "TTS API 调用失败", error: result },
        { status: 502 }
      )
    }

    const audioUrl = result?.output?.audio?.url
    if (!audioUrl) {
      return NextResponse.json(
        { success: false, message: "TTS 未返回音频 URL" },
        { status: 502 }
      )
    }

    // 7. 代理下载音频并返回
    const audioRes = await fetch(audioUrl)
    if (!audioRes.ok) {
      return NextResponse.json(
        { success: false, message: "音频文件下载失败" },
        { status: 502 }
      )
    }

    const audioBuffer = await audioRes.arrayBuffer()
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `inline; filename="tts-${Date.now()}.mp3"`,
      },
    })
  } catch (e: any) {
    console.error("TTS 合成失败:", e.message)
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
