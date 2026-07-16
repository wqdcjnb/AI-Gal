/**
 * GET /api/auth/me — 获取当前用户信息
 */
import { parseAccessToken } from "@/lib/auth/token";
import { default as app } from "@/lib/cloudbase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser, createUser } from "@/lib/user-store";

const COOKIE_NAME = "cloudbase_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ loggedIn: false, user: null });

    const user = parseAccessToken(token);
    if (!user) return NextResponse.json({ loggedIn: false, user: null });

    // Try SQLite first, create if not exists
    let userDoc = getUser(user.uid)
    if (!userDoc) userDoc = createUser(user.uid, user.email || user.uid)

    let avatarUrl = userDoc.avatar_url || ""
    // If avatar is a CloudBase fileId, resolve it
    if (avatarUrl.startsWith("cloud://")) {
      try {
        const urlResult = await app.getTempFileURL({ fileList: [avatarUrl] });
        avatarUrl = urlResult.fileList?.[0]?.tempFileURL || avatarUrl;
      } catch { /* ignore */ }
    }

    return NextResponse.json({
      loggedIn: true,
      user: { email: user.email, uid: user.uid, nickname: userDoc.nickname, avatarUrl },
    });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
