/**
 * POST /api/auth/send-code
 * 发送邮箱验证码（CloudBase Auth 发送真实邮件）
 * Body: { email, type: "signup" | "signin" }
 */
import { sendVerificationCode } from "@/lib/cloudbase-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, type } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    const result = await sendVerificationCode(
      email.trim().toLowerCase(),
      type === "signin" ? "signin" : "signup"
    );

    return NextResponse.json(result, result.success ? undefined : { status: 400 });
  } catch {
    return NextResponse.json(
      { success: false, message: "发送验证码失败" },
      { status: 500 }
    );
  }
}
