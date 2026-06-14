/**
 * POST /api/auth/login
 * 登录 → 转发到云函数 auth-login，API Route 负责 Cookie 管理
 *
 * 密码登录: { email, password, type: "password" }
 * 验证码登录: { email, verificationCode, verificationId, type: "code" }
 */
import { loginWithPassword, loginWithCode } from "@/lib/auth/login";
import { validatePasswordStrength } from "@/lib/auth/validate";
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

    // ---- 参数校验 ----
    if (type === "code") {
      const { verificationCode, verificationId } = body;
      if (!verificationCode || !verificationId) {
        return NextResponse.json(
          { success: false, message: "请输入验证码" },
          { status: 400 }
        );
      }
    } else {
      const { password } = body;
      if (!password) {
        return NextResponse.json(
          { success: false, message: "请输入密码" },
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
    }

    // ---- 调用本地登录函数 ----
    let result: { success: boolean; accessToken?: string; uid?: string; message: string };

    if (type === "code") {
      result = await loginWithCode(
        email.trim().toLowerCase(), body.verificationCode, body.verificationId
      );
    } else {
      result = await loginWithPassword(email.trim().toLowerCase(), body.password);
    }

    if (!result.success || !result.accessToken) {
      return NextResponse.json(result, { status: 401 });
    }

    // ---- 设置登录 Cookie ----
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, result.accessToken!, {
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
