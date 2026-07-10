import { db } from "@/lib/cloudbase";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const collections = ["projects", "chapters"];
    const results: Record<string, number> = {};
    for (const name of collections) {
      const res = await db.collection(name).get();
      const count = res.data?.length || 0;
      for (const doc of res.data || []) {
        await db.collection(name).doc(doc._id).remove();
      }
      results[name] = count;
    }
    return NextResponse.json({ success: true, cleared: results });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
