/**
 * POST /api/admin/reset-users
 * 清空 users 集合（测试用）
 */

import { db } from "@/lib/cloudbase"
import { NextResponse } from "next/server"
import { COLLECTIONS } from "@/lib/db-schema"

export async function POST() {
  try {
    const col = db.collection(COLLECTIONS.USERS)
    const res = await col.get()
    const count = res.data?.length || 0

    // 逐条删除
    for (const doc of res.data || []) {
      await col.doc(doc._id).remove()
    }

    return NextResponse.json({
      success: true,
      message: `已删除 ${count} 条用户记录`,
      deleted: count,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: String(error) },
      { status: 500 }
    )
  }
}
