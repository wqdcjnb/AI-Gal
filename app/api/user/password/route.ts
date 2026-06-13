import { sendResetPasswordCode, resetPassword } from "@/lib/cloudbase-auth"
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
      return NextResponse.json({ success: false, message: "未登录" }, { status: 401 })
    }

    if (action === "send-code") {
      const { parseAccessToken } = await import("@/lib/cloudbase-auth")
      const email = parseAccessToken(userToken)?.email
      if (!email) {
        return NextResponse.json({ success: false, message: "无法获取邮箱" }, { status: 400 })
      }
      const result = await sendResetPasswordCode(email)
      return NextResponse.json(result, result.success ? undefined : { status: 400 })
    }

    if (action === "reset") {
      const { code, password } = body
      if (!code || code.length < 6) {
        return NextResponse.json({ success: false, message: "请输入 6 位验证码" }, { status: 400 })
      }
      if (!password || password.length < 6) {
        return NextResponse.json({ success: false, message: "新密码至少需要 6 个字符" }, { status: 400 })
      }
      const result = await resetPassword(userToken, password, code)
      return NextResponse.json(result, result.success ? undefined : { status: 400 })
    }

    return NextResponse.json({ success: false, message: "无效的 action" }, { status: 400 })
  } catch (error) {
    console.error("[Password] 操作失败:", error)
    return NextResponse.json({ success: false, message: "操作失败，请稍后重试" }, { status: 500 })
  }
}
