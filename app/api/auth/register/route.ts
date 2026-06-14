/**
 * POST /api/auth/register
 * 注册：邮箱 + 密码 + 验证码 → CloudBase Auth 创建用户
 * Body: { email, password, verificationCode, verificationId }
 */
import { registerUser, validatePasswordStrength } from "@/lib/cloudbase-auth";
import { db } from "@/lib/cloudbase";
import { COLLECTIONS } from "@/lib/db-schema";
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

    const strength = validatePasswordStrength(password)
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

    // 存储生成的 username，供 login 时查询
    if (result.username) {
      try {
        const existing = await db.collection(COLLECTIONS.USERS).where({ uid: result.uid || email }).limit(1).get()
        if (!existing.data?.length) {
          await db.collection(COLLECTIONS.USERS).add({
            uid: result.uid || email,
            email,
            username: result.username,
            nickname: email.split("@")[0] || email,
            avatarUrl: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        }
      } catch { /* 静默失败，不影响注册 */ }
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
