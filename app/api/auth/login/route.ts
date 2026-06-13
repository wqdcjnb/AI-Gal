/**
 * POST /api/auth/login
 * 登录：密码登录 或 验证码登录 → CloudBase Auth 验证 → 写入 Cookie
 *
 * 密码登录: { email, password, type: "password" }
 * 验证码登录: { email, verificationCode, verificationId, type: "code" }
 */
import { loginWithPassword, loginWithCode } from "@/lib/cloudbase-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cloudbase_token";
const COOKIE_MAX_AGE = 7 * 24 * 3600;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "请输入邮箱地址" },
        { status: 400 }
      );
    }

    let result: {
      success: boolean;
      accessToken?: string;
      refreshToken?: string;
      uid?: string;
      message: string;
    };

    if (type === "code") {
      const { verificationCode, verificationId } = body;
      if (!verificationCode || !verificationId) {
        return NextResponse.json(
          { success: false, message: "请输入验证码" },
          { status: 400 }
        );
      }
      result = await loginWithCode(
        email.trim().toLowerCase(),
        verificationCode,
        verificationId
      );
    } else {
      const { password } = body;
      if (!password) {
        return NextResponse.json(
          { success: false, message: "请输入密码" },
          { status: 400 }
        );
      }
      result = await loginWithPassword(email.trim().toLowerCase(), password);
    }

    if (!result.success || !result.accessToken) {
      return NextResponse.json(result, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      uid: result.uid,
      message: result.message,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
