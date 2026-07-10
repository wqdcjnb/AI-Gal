import { db } from "@/lib/cloudbase";
import { NextResponse } from "next/server";

const COLL = "chapters";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const res = projectId
      ? await db.collection(COLL).where({ projectId }).get()
      : await db.collection(COLL).get();
    return NextResponse.json({ success: true, chapters: res.data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // 支持批量保存：单个对象或数组
    const docs = Array.isArray(body) ? body : [body];
    for (const doc of docs) {
      const { _id, ...data } = doc;
      await db.collection(COLL).doc(_id).set(data);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
