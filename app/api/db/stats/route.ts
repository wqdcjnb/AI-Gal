import { db } from "@/lib/cloudbase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const names = ["users","projects","characters","character_sprites","chapters","dialogues","branches","backgrounds","audio_assets","export_records","favorites"];
    const stats: Record<string, number> = {};
    for (const name of names) {
      try { const r = await db.collection(name).count(); stats[name] = r.total || 0; }
      catch { stats[name] = -1; }
    }
    return NextResponse.json({ success: true, stats });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
