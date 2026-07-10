import { db } from "@/lib/cloudbase";
import { NextRequest, NextResponse } from "next/server";

const COLL = "projects";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await db.collection(COLL).doc(id).get();
    if (!res.data || !res.data.length) {
      return NextResponse.json({ success: false, message: "项目不存在" }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: res.data[0] });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id: _drop1, _id: _drop2, ...updates } = body;
    await db.collection(COLL).doc(id).update({ ...updates, updatedAt: new Date().toISOString() });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection(COLL).doc(id).remove();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
