/**
 * GET  /api/subsections?chapterId=xxx
 * POST /api/subsections — save sub sections for a chapter (replaces all)
 */
import { NextResponse } from "next/server"
import { rdb } from "@/lib/cloudbase/cloudbase"
import { upsertSubSection } from "@/lib/db/project-store"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const chapterId = searchParams.get("chapterId")
    if (!chapterId) return NextResponse.json({ success: false, message: "缺少 chapterId" }, { status: 400 })

    const { data, error } = await rdb.from("sub_sections")
      .select("*").eq("chapter_id", chapterId).order("sort_order")

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { chapterId, sections } = await request.json()
    if (!chapterId) return NextResponse.json({ success: false, message: "缺少 chapterId" }, { status: 400 })

    // 安全 upsert：逐条更新或插入，不会删除同章节其他小节
    for (const s of sections) {
      const row = {
        id: s.id,
        chapter_id: chapterId,
        title: s.title || '',
        background: s.background || '',
        bgm: s.bgm || '',
        cg_trigger: s.cg_trigger || s.cgTrigger || null,
        transition: s.transition || 'cut',
        is_branch: s.is_branch ?? (s.isBranch ? 1 : 0),
        branch_from: s.branch_from || s.branchFrom || null,
        dialogues: typeof s.dialogues === 'string' ? s.dialogues : JSON.stringify(s.dialogues || []),
        triggers: typeof s.triggers === 'string' ? s.triggers : JSON.stringify(s.triggers || []),
        sort_order: s.sort_order ?? 0,
      }
      await upsertSubSection(row)
    }
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
