import { NextResponse } from "next/server"
import { rdb } from "@/lib/cloudbase/cloudbase"

/**
 * GET /api/voice/profiles?projectId=xxx
 * 获取声形列表（从 PostgreSQL）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId") || ""

    // 返回全部声形（包含全局预设 + 各项目自定义）
    const query = rdb.from("voice_profiles").select("*").order("created_at", { ascending: false })

    const { data, error } = await query
    if (error) {
      console.error("[voice/profiles] rdb 查询错误:", JSON.stringify(error))
      return NextResponse.json({ success: false, message: error.message || String(error) }, { status: 500 })
    }

    const profiles = (data || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      gender: d.gender,
      age: d.age,
      voiceStyle: d.voice_style,
      tone: d.tone,
      ttsSpeakerId: d.tts_speaker_id,
      model: d.model || "",
      description: d.description || "",
      projectId: d.project_id || "",
      createdAt: d.created_at || 0,
      updatedAt: d.updated_at || 0,
    }))

    return NextResponse.json({ success: true, data: profiles })
  } catch (e: any) {
    console.error("[voice/profiles] GET 异常:", e?.message || e)
    return NextResponse.json({ success: false, message: e?.message || "服务器错误" }, { status: 500 })
  }
}

/**
 * POST /api/voice/profiles
 * 创建声形（写入 PostgreSQL）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { projectId, name, gender, age, voiceStyle, tone, ttsSpeakerId, model, description } = body

    if (!name || !gender || !age || !voiceStyle || !tone || !ttsSpeakerId) {
      return NextResponse.json({ success: false, message: "缺少必要字段" }, { status: 400 })
    }

    const now = Date.now()
    const id = `vp_${now}`

    const { error } = await rdb.from("voice_profiles").insert({
      id,
      project_id: projectId || null,
      name,
      gender,
      age,
      voice_style: voiceStyle,
      tone,
      tts_speaker_id: ttsSpeakerId,
      model: model || "cosyvoice-v3-flash",
      description: description || "",
      created_at: now,
      updated_at: now,
    })

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
        name,
        gender,
        age,
        voiceStyle,
        tone,
        ttsSpeakerId,
        model: model || "cosyvoice-v3-flash",
        description: description || "",
        projectId: projectId || "",
        createdAt: now,
        updatedAt: now,
      },
    })
  } catch (e: any) {
    console.error("[voice/profiles] POST 异常:", e?.message || e)
    return NextResponse.json({ success: false, message: e?.message || "服务器错误" }, { status: 500 })
  }
}
