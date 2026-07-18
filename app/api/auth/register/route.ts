/**
 * POST /api/auth/register
 * 注册 → 转发到云函数 auth-register，API Route 负责 Cookie 和 SQLite 写入
 */
import { registerUser } from "@/lib/auth/register";
import { validatePasswordStrength } from "@/lib/auth/validate";
import { createUser } from "@/lib/user-store";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cloudbase_token";
const COOKIE_MAX_AGE = 7 * 24 * 3600;

export async function POST(request: Request) {
  try {
    const { email, password, verificationCode, verificationId } =
      await request.json();

    if (!email || !password || !verificationCode || !verificationId) {
      return NextResponse.json(
        { success: false, message: "请填写所有必填项" },
        { status: 400 }
      );
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json(
        { success: false, message: strength.message },
        { status: 400 }
      );
    }

    const result = await registerUser(
      email.trim().toLowerCase(),
      password,
      verificationCode,
      verificationId
    );

    if (!result.success || !result.accessToken) {
      return NextResponse.json(result, { status: 400 });
    }

    // 写入 profiles 表
    await createUser(result.uid || email, email.trim().toLowerCase());

    // 设置登录 Cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json(
      { success: true, uid: result.uid, message: "注册并登录成功" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
