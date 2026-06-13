/**
 * GET /api/auth/me
 * 获取当前用户信息（从 Cookie 中的 CloudBase access_token 解析）
 */
import { parseAccessToken } from "@/lib/cloudbase-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cloudbase_token";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    const user = parseAccessToken(token);

    if (!user) {
      return NextResponse.json({ loggedIn: false, user: null });
    }

    return NextResponse.json({
      loggedIn: true,
      user: { email: user.email, uid: user.uid },
    });
  } catch {
    return NextResponse.json({ loggedIn: false, user: null });
  }
}
