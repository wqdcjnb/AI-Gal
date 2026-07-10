import { db } from "@/lib/cloudbase";
import { NextRequest, NextResponse } from "next/server";

const COLL = "chapters";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection(COLL).doc(id).remove();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
