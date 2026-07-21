/**
 * GET /api/auth/me — 获取当前用户信息
 */
import { parseAccessToken } from "@/lib/auth/token";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUser, createUser } from "@/lib/db/user-store";

const COOKIE_NAME = "cloudbase_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ loggedIn: false, user: null });

    const user = parseAccessToken(token);
    if (!user) return NextResponse.json({ loggedIn: false, user: null });

    let userDoc = await getUser(user.uid)
    if (!userDoc) userDoc = await createUser(user.uid, user.email || user.uid)

    return NextResponse.json({
      loggedIn: true,
      user: { email: user.email, uid: user.uid, nickname: userDoc.nickname, avatarUrl: userDoc.avatar_url || "" },
    });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
