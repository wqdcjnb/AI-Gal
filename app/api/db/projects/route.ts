import { db } from "@/lib/cloudbase";
import { parseAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COLL = "projects";

async function getUserId(): Promise<string | null> {
  const token = (await cookies()).get("cloudbase_token")?.value;
  if (!token) return null;
  return parseAccessToken(token)?.uid || null;
}

export async function GET() {
  try {
    const uid = await getUserId();
    const res = uid
      ? await db.collection(COLL).where({ userId: uid }).get()
      : await db.collection(COLL).get();
    const projects = res.data || [];
    return NextResponse.json({ success: true, projects });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const uid = await getUserId();
    if (!uid) return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    const body = await request.json();
    const { id, name, description, coverUrl, tags, storyLength, chapterCount, worldSetting } = body;
    const doc = {
      userId: uid,
      name: name || "未命名游戏",
      description: description || "",
      coverUrl: coverUrl || "",
      tags: tags || [],
      storyLength: storyLength || "短篇",
      chapterCount: chapterCount || 8,
      worldSetting: worldSetting || "",
      currentStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isPublic: false,
    };
    await db.collection(COLL).doc(id).set(doc);
    return NextResponse.json({ success: true, project: { id, ...doc } });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
