import { NextResponse } from "next/server"
import { rdb } from "@/lib/cloudbase/cloudbase"
import { deleteFromStorage } from "@/lib/storage/pg-storage"

/**
 * PATCH /api/voice/profiles/[id] — 更新声形
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const fields: Record<string, any> = { updated_at: Date.now() }
    if (body.name !== undefined) fields.name = body.name
    if (body.gender !== undefined) fields.gender = body.gender
    if (body.age !== undefined) fields.age = body.age
    if (body.voiceStyle !== undefined) fields.voice_style = body.voiceStyle
    if (body.tone !== undefined) fields.tone = body.tone
    if (body.ttsSpeakerId !== undefined) fields.tts_speaker_id = body.ttsSpeakerId
    if (body.model !== undefined) fields.model = body.model
    if (body.description !== undefined) fields.description = body.description

    const { error } = await rdb.from("voice_profiles").update(fields).eq("id", id)
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

/**
 * DELETE /api/voice/profiles/[id] — 删除声形
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 先查参考音频 URL，删存储文件
    const { data: rows } = await rdb.from("voice_profiles").select("ref_audio_url").eq("id", id)
    const url = (rows as any)?.[0]?.ref_audio_url
    if (url) await deleteFromStorage(url)
    const { error } = await rdb.from("voice_profiles").delete().eq("id", id)
    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
