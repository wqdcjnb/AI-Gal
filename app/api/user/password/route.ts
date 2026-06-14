/**
 * POST /api/user/password
 * 修改密码
 *   action=send-code → 发送验证码
 *   action=reset → 修改密码 + 清除 Cookie
 */
import { sendPasswordChangeCode, modifyPassword } from "@/lib/auth/password";
import { validatePasswordStrength } from "@/lib/auth/validate";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "cloudbase_token";

async function getUserToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    const userToken = await getUserToken();
    if (!userToken) {
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 });
    }

    if (action === "send-code") {
      const result = await sendPasswordChangeCode(userToken);
      return NextResponse.json(result, result.success ? undefined : { status: 400 });
    }

    if (action === "reset") {
      const { code, password, verificationId } = body;
      if (!code || code.length < 6) return NextResponse.json({ success: false, message: "请输入验证码" }, { status: 400 });
      if (!verificationId) return NextResponse.json({ success: false, message: "缺少 verificationId" }, { status: 400 });
      if (!password) return NextResponse.json({ success: false, message: "请输入新密码" }, { status: 400 });

      const strength = validatePasswordStrength(password);
      if (!strength.valid) return NextResponse.json({ success: false, message: strength.message }, { status: 400 });

      const result = await modifyPassword(userToken, password, code, verificationId);
      if (!result.success) return NextResponse.json(result, { status: 400 });

      const cookieStore = await cookies();
      cookieStore.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, message: "无效 action" }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, message: "操作失败" }, { status: 500 });
  }
}
