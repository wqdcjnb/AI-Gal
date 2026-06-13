/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
/**
 * CloudBase 原生 Auth 服务模块
 *
 * 使用 CloudBase Auth HTTP API 实现：
 * - 邮箱验证码发送（CloudBase 发送真实邮件）
 * - 注册（邮箱 + 密码 + 验证码）
 * - 登录（密码 或 验证码）
 * - Session 管理（CloudBase access_token）
 *
 * CloudBase Auth API 文档：https://docs.cloudbase.net/api-reference/server/node-sdk/auth
 */
import app, { db } from "@/lib/cloudbase";
import { COLLECTIONS } from "@/lib/db-schema";

// CloudBase Auth API 基础路径
const AUTH_API_BASE = "/auth/v1";

// 使用 SDK 内部的 tcbopenapicommonrequester 来发起带签名的请求
// 这是 CloudBase Node SDK 内部使用的 HTTP 请求模块
const { request: cloudbaseRequest } = require("@cloudbase/node-sdk/dist/utils/tcbopenapicommonrequester");

interface AuthApiResult {
  statusCode: number;
  body: any;
}

/** 调用 CloudBase Auth API */
async function authApi(
  path: string,
  data: Record<string, any>,
  accessToken?: string
): Promise<AuthApiResult> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  return cloudbaseRequest({
    config: (app as any).config,
    method: "POST",
    path: `${AUTH_API_BASE}${path}`,
    data,
    headers,
    token: accessToken || undefined,
  });
}

/** 获取 CloudBase Admin Access Token */
async function getAdminToken(): Promise<string> {
  const result = await authApi("/token/clientCredential", {
    grant_type: "client_credentials",
  });
  if (result.statusCode !== 200 || !result.body?.access_token) {
    throw new Error("获取 CloudBase Admin Token 失败");
  }
  return result.body.access_token;
}

/**
 * 发送邮箱验证码
 * CloudBase 会将验证码发送到用户邮箱
 */
export async function sendVerificationCode(
  email: string,
  type: "signup" | "signin" = "signup"
): Promise<{
  success: boolean;
  verificationId?: string;
  expiresIn?: number;
  message: string;
}> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/verification",
      { email, type },
      adminToken
    );

    if (result.statusCode === 200 && result.body?.verification_id) {
      console.log(`[CloudBase Auth] 验证码已发送: ${email} (type: ${type})`);
      return {
        success: true,
        verificationId: result.body.verification_id,
        expiresIn: result.body.expires_in || 600,
        message: "验证码已发送到您的邮箱",
      };
    }

    return {
      success: false,
      message: result.body?.error_description || "发送验证码失败",
    };
  } catch (error: any) {
    console.error("[CloudBase Auth] 发送验证码失败:", error.message);
    return { success: false, message: "发送验证码失败，请稍后重试" };
  }
}

/**
 * 注册新用户（邮箱 + 密码 + 验证码）
 * CloudBase Auth 创建用户并返回 token
 */
export async function registerUser(
  email: string,
  password: string,
  verificationCode: string,
  verificationId: string
): Promise<{
  success: boolean;
  username?: string;
  accessToken?: string;
  refreshToken?: string;
  uid?: string;
  message: string;
}> {
  try {
    const username = "u" + Date.now().toString().slice(-8)
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/signup",
      {
        username,
        email,
        password,
        verification_code: verificationCode,
        verification_id: verificationId,
      },
      adminToken
    );

    if (result.statusCode === 200 || result.statusCode === 201) {
      console.log(`[CloudBase Auth] 用户注册成功: ${email}`);
      return {
        success: true,
        username,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "注册成功",
      };
    }

    const errorMsg =
      result.body?.error_description ||
      result.body?.message ||
      "注册失败，请重试";
    return { success: false, message: errorMsg };
  } catch (error: any) {
    console.error("[CloudBase Auth] 注册失败:", error.message);
    return { success: false, message: "注册失败，请稍后重试" };
  }
}

/**
 * 密码登录
 * CloudBase Auth 验证邮箱 + 密码
 */
export async function loginWithPassword(
  email: string,
  password: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  uid?: string;
  message: string;
}> {
  try {
    // 从 users 集合查询注册时生成的 username
    let username = ""
    try {
      const res = await db.collection(COLLECTIONS.USERS).where({ email }).limit(1).get()
      username = res.data?.[0]?.username || ""
    } catch { /* users 集合不存在则降级 */ }

    // 降级：查不到 username 时直接尝试 email（兼容旧用户）
    const loginName = username || email

    const adminToken = await getAdminToken();
    const result = await authApi(
      "/signin",
      { username: loginName, password },
      adminToken
    );

    if (result.statusCode === 200) {
      console.log(`[CloudBase Auth] 密码登录成功: ${email}`);
      return {
        success: true,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "登录成功",
      };
    }

    const errorMsg =
      result.body?.error_description ||
      result.body?.message ||
      "登录失败，请检查邮箱和密码";
    return { success: false, message: errorMsg };
  } catch (error: any) {
    console.error("[CloudBase Auth] 密码登录失败:", error.message);
    return { success: false, message: "登录失败，请稍后重试" };
  }
}

/**
 * 验证验证码，获取 verification_token
 * POST /auth/v1/verification/verify
 */
async function verifyCode(
  verificationId: string,
  verificationCode: string
): Promise<{
  success: boolean;
  verificationToken?: string;
  message: string;
}> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/verification/verify",
      { verification_id: verificationId, verification_code: verificationCode },
      adminToken
    );

    if (result.statusCode === 200 && result.body?.verification_token) {
      return {
        success: true,
        verificationToken: result.body.verification_token,
        message: "验证成功",
      };
    }

    // 清理 CloudBase API 返回的错误消息（去除 Go 格式化后缀）
    const rawMsg = result.body?.error_description || "验证码错误";
    const cleanMsg = rawMsg.replace(/%!\(EXTRA.*?\)/, "").trim();
    return { success: false, message: cleanMsg };
  } catch {
    return { success: false, message: "验证失败，请稍后重试" };
  }
}

/**
 * 验证码登录
 * 两步流程：
 * 1. 验证验证码 → 获取 verification_token
 * 2. 用 verification_token 登录 → 获取 access_token
 */
export async function loginWithCode(
  email: string,
  verificationCode: string,
  verificationId: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  uid?: string;
  message: string;
}> {
  try {
    // Step 1: 验证验证码，获取 verification_token
    const verifyResult = await verifyCode(verificationId, verificationCode);
    if (!verifyResult.success || !verifyResult.verificationToken) {
      return { success: false, message: verifyResult.message };
    }

    // Step 2: 用 verification_token 登录
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/signin",
      { verification_token: verifyResult.verificationToken },
      adminToken
    );

    if (result.statusCode === 200) {
      console.log(`[CloudBase Auth] 验证码登录成功: ${email}`);
      return {
        success: true,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "登录成功",
      };
    }

    const errorMsg =
      result.body?.error_description ||
      result.body?.message ||
      "登录失败，请重试";
    return { success: false, message: errorMsg };
  } catch (error: any) {
    console.error("[CloudBase Auth] 验证码登录失败:", error.message);
    return { success: false, message: "登录失败，请稍后重试" };
  }
}

/**
 * 从 CloudBase access_token 解析用户信息
 */
export function parseAccessToken(token: string): {
  email: string;
  uid: string;
} | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf-8")
    );

    // CloudBase JWT payload 中的用户标识
    const uid = payload.sub || payload.uid || "";
    const email = payload.email || uid || "";

    if (!uid) return null;

    return { uid, email };
  } catch {
    return null;
  }
}

/**
 * 用户级 Auth API 调用（直接 HTTP，不走 cloudbaseRequest 的 admin 签名）
 */
async function userAuthApi(
  path: string,
  data: any,
  userAccessToken: string,
  method = "POST"
) {
  const envId = process.env.CLOUDBASE_ENV_ID || (app as any).config?.env || ""

  const url = `https://${envId}.service.tcloudbase.com/auth/v1${path}`

  console.log("========== CloudBase Request ==========")
  console.log("envId:", envId)
  console.log("url:", url)
  console.log("method:", method)
  console.log("body:", JSON.stringify(data))

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
    body: JSON.stringify(data),
  })

  const text = await res.text()

  console.log("status:", res.status)
  console.log("response:", text)

  return JSON.parse(text)
}

/**
 * 发送重置密码验证码
 *
 * POST /auth/v1/user/reauthenticate
 * Authorization: Bearer <user_access_token>
 * Body: { verify_opt: "email_code" }
 *
 * 返回 verificationId 用于后续修改密码时传递
 */
export async function sendResetPasswordCode(email: string) {
  return sendVerificationCode(email, "signup")
}

/**
 * 修改密码
 *
 * PATCH /auth/v1/user/password
 * Authorization: Bearer <user_access_token>
 * Body: { new_password, confirm_password, verify_code, verification_id? }
 */
export async function resetPassword(
  userAccessToken: string,
  newPassword: string,
  verifyCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    const resBody = await userAuthApi(
      "/user/password",
      { new_password: newPassword, confirm_password: newPassword, verify_code: verifyCode },
      userAccessToken,
      "PATCH"
    )
    if (!resBody?.error_description && !resBody?.error) {
      return { success: true, message: "密码修改成功" }
    }
    return {
      success: false,
      message: resBody?.error_description || resBody?.error || "密码修改失败",
    }
  } catch (error: any) {
    return { success: false, message: error.message || "密码修改失败" }
  }
}

/**
 * 刷新 access_token
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{
  success: boolean;
  accessToken?: string;
  message: string;
}> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/token",
      {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      },
      adminToken
    );

    if (result.statusCode === 200 && result.body?.access_token) {
      return {
        success: true,
        accessToken: result.body.access_token,
        message: "Token 已刷新",
      };
    }

    return {
      success: false,
      message: result.body?.error_description || "Token 刷新失败",
    };
  } catch {
    return { success: false, message: "Token 刷新失败" };
  }
}
