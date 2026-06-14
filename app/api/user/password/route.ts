/**
 * POST /api/user/password
 * 修改密码（已登录用户）
 *
 * Body (发送验证码):
 *   { action: "send-code" }
 *   → 调用 CloudBase reauthenticate API 向用户邮箱发送验证码
 *   → 返回 { success, verificationId, message }
 *
 * Body (执行修改):
 *   { action: "reset", code, password, verificationId }
 *   → 调用 CloudBase password PATCH API
 *   → 返回 { success, message }
 */
import {
  sendPasswordChangeCode,
  modifyPassword,
  validatePasswordStrength,
} from "@/lib/cloudbase-auth"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const COOKIE_NAME = "cloudbase_token"

async function getUserToken(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value ?? null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    const userToken = await getUserToken()
    if (!userToken) {
      return NextResponse.json(
        { success: false, message: "未登录，请先登录" },
        { status: 401 }
      )
    }

    // ---- 发送验证码 ----
    if (action === "send-code") {
      const result = await sendPasswordChangeCode(userToken)
      return NextResponse.json(
        result,
        result.success ? undefined : { status: 400 }
      )
    }

    // ---- 执行密码修改 ----
    if (action === "reset") {
      const { code, password, verificationId } = body

      // 参数校验
      if (!code || code.length < 6) {
        return NextResponse.json(
          { success: false, message: "请输入 6 位验证码" },
          { status: 400 }
        )
      }

      if (!verificationId) {
        return NextResponse.json(
          {
            success: false,
            message: "缺少 verificationId，请先发送验证码",
          },
          { status: 400 }
        )
      }

      if (!password) {
        return NextResponse.json(
          { success: false, message: "请输入新密码" },
          { status: 400 }
        )
      }

      const strength = validatePasswordStrength(password)
      if (!strength.valid) {
        return NextResponse.json(
          { success: false, message: strength.message },
          { status: 400 }
        )
      }

      const result = await modifyPassword(
        userToken,
        password,
        code,
        verificationId
      )

      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      // 密码修改成功后清除旧的登录 cookie，强制用户重新登录
      const cookieStore = await cookies()
      cookieStore.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })

      return NextResponse.json(result)
    }

    return NextResponse.json(
      { success: false, message: "无效的 action，支持: send-code | reset" },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "操作失败，请稍后重试" },
      { status: 500 }
    )
  }
}
