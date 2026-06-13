/**
 * POST /api/auth/register
 * 注册：邮箱 + 密码 + 验证码 → CloudBase Auth 创建用户
 * Body: { email, password, verificationCode, verificationId }
 */
import { registerUser } from "@/lib/cloudbase-auth";
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

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "密码至少需要 6 个字符" },
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
