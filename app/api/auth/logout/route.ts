/**
 * POST /api/auth/logout
 * 登出：清除 Cookie 中的 CloudBase access_token
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cloudbase_token";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true, message: "已登出" });
}
