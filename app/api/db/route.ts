/**
 * CloudBase 数据库示例 API
 * GET /api/db - 查询 test 集合数据
 * POST /api/db - 向 test 集合添加文档（集合不存在时自动创建）
 */
import { db } from "@/lib/cloudbase";
import { NextResponse } from "next/server";

const COLLECTION = "test";

// 确保集合存在（不存在则创建）
async function ensureCollection(name: string) {
  try {
    await db.createCollection(name);
    console.log(`[CloudBase] 集合 "${name}" 创建成功`);
  } catch (error: unknown) {
    // 集合已存在时会报错，忽略即可
    if (!String(error).includes("already exist") && !String(error).includes("ResourceConflict")) {
      // eslint-disable-next-line no-console
      console.warn(`[CloudBase] 创建集合 "${name}" 出现异常:`, String(error));
    }
  }
}

export async function GET() {
  try {
    await ensureCollection(COLLECTION);
    const result = await db.collection(COLLECTION).limit(10).get();
    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureCollection(COLLECTION);
    const body = await request.json();
    const result = await db.collection(COLLECTION).add({
      ...body,
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
