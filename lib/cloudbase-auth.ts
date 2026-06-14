/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
/**
 * CloudBase 原生 Auth 服务模块
 *
 * 腾讯云 API TC3 签名（用于调用 ModifyUser 等管理 API）
 */
import crypto from "crypto"

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex")
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest()
}

/** 调用腾讯云 API（TC3-HMAC-SHA256 签名） */
async function callTencentCloudAPI(
  action: string,
  params: Record<string, any>,
  config: { secretId: string; secretKey: string; region?: string }
): Promise<any> {
  const region = config.region || "ap-shanghai"
  const service = "tcb"
  const host = "tcb.tencentcloudapi.com"
  const version = "2018-06-08"
  const timestamp = Math.floor(Date.now() / 1000)
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)

  const body = JSON.stringify(params)
  const hashedPayload = sha256(body)

  // Step 1: Canonical Request
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`
  const signedHeaders = "content-type;host"
  const canonicalRequest = [
    "POST",
    "/",
    "",
    canonicalHeaders,
    signedHeaders,
    hashedPayload,
  ].join("\n")

  // Step 2: String to Sign
  const credentialScope = `${date}/${service}/tc3_request`
  const hashedCanonicalRequest = sha256(canonicalRequest)
  const stringToSign = [
    "TC3-HMAC-SHA256",
    String(timestamp),
    credentialScope,
    hashedCanonicalRequest,
  ].join("\n")

  // Step 3: Signature
  const secretDate = hmacSha256(Buffer.from(`TC3${config.secretKey}`, "utf-8"), date)
  const secretService = hmacSha256(secretDate, service)
  const secretSigning = hmacSha256(secretService, "tc3_request")
  const signature = hmacSha256(secretSigning, stringToSign).toString("hex")

  // Step 4: Authorization header
  const authorization = `TC3-HMAC-SHA256 Credential=${config.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  // Step 5: Request
  const url = `https://${host}/`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": host,
      "X-TC-Action": action,
      "X-TC-Version": version,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Region": region,
      "Authorization": authorization,
    },
    body,
  })

  const text = await res.text()

  let result: any
  try { result = JSON.parse(text) } catch { result = { raw: text } }
  return { status: res.status, body: result }
}
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
import app from "@/lib/cloudbase";

// CloudBase Auth API 基础路径
const AUTH_API_BASE = "/auth/v1";

// 使用 SDK 内部的 tcbopenapicommonrequester 来发起带签名的请求
const { request: cloudbaseRequest } = require("@cloudbase/node-sdk/dist/utils/tcbopenapicommonrequester");

// SDK 内部的 tcbapirequester（用于 admin action 类 API 调用）
const tcbapicaller = require("@cloudbase/node-sdk/dist/utils/tcbapirequester");

interface AuthApiResult {
  statusCode: number;
  body: any;
}

/** 调用 CloudBase Auth API（使用 admin 凭证签名） */
async function authApi(
  path: string,
  data: Record<string, any>,
  accessToken?: string,
  method: "POST" | "PATCH" = "POST"
): Promise<AuthApiResult> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  return cloudbaseRequest({
    config: (app as any).config,
    method,
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
    // CloudBase Auth /signin 的 username 参数接受 email 作为登录标识
    // 直接使用 email 登录，避免因注册时自动生成的 username 不匹配导致登录失败
    const adminToken = await getAdminToken();
    const result = await authApi(
      "/signin",
      { username: email, password },
      adminToken
    );

    if (result.statusCode === 200) {
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
 *
 * CloudBase Auth v1 用户端点域名：
 *   https://{envId}.api.tcloudbasegateway.com/auth/v1/...
 *
 * 常用端点：
 *   POST /auth/v1/user/reauthenticate  — 重新认证（发送验证码）
 *   PATCH /auth/v1/user/password        — 修改密码
 */
async function userAuthApi(
  path: string,
  data: any,
  userAccessToken: string,
  method = "POST"
) {
  const envId = process.env.CLOUDBASE_ENV_ID || (app as any).config?.env || ""

  // CloudBase 用户级 Auth API 使用 api.tcloudbasegateway.com 域名
  const url = `https://${envId}.api.tcloudbasegateway.com/auth/v1${path}`

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
    body: JSON.stringify(data),
  })

  const text = await res.text()


  // 处理空响应（如修改密码成功时 CloudBase 返回空 body）
  if (!text || text.trim() === "") {
    return {}
  }

  return JSON.parse(text)
}

/**
 * 验证密码强度
 *
 * 返回 validity + 逐项检查结果，供前端展示密码强度指示器。
 * 硬性要求：至少 6 个字符。推荐：8+ 位、大写、小写、数字、特殊字符。
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message: string
  checks: { label: string; passed: boolean }[]
} {
  const checks = [
    { label: "至少 6 个字符", passed: password.length >= 6 },
  ]

  const allPassed = checks.every((c) => c.passed)

  return {
    valid: allPassed,
    message: allPassed ? "密码可用" : "密码至少需要 6 个字符",
    checks,
  }
}

/**
 * 发送修改密码验证码（已登录用户）
 *
 * 从用户的 access_token 中解析邮箱，通过 Admin API 发送验证码到邮箱。
 * 返回 verificationId 用于后续 modifyPassword。
 */
export async function sendPasswordChangeCode(
  userAccessToken: string
): Promise<{
  success: boolean
  verificationId?: string
  expiresIn?: number
  message: string
}> {
  try {
    const parsed = parseAccessToken(userAccessToken)
    if (!parsed?.email) {
      return { success: false, message: "无法获取账号邮箱" }
    }
    const result = await sendVerificationCode(parsed.email, "signup")
    if (result.success && result.verificationId) {
      return {
        success: true,
        verificationId: result.verificationId,
        expiresIn: result.expiresIn || 300,
        message: "验证码已发送到您的邮箱",
      }
    }
    return { success: false, message: result.message || "发送验证码失败" }
  } catch (error: any) {
    return { success: false, message: "发送验证码失败，请稍后重试" }
  }
}

/**
 * 修改用户密码
 *
 * 使用腾讯云 TCB API ModifyUser 直接修改密码（管理员权限）。
 * 此 API 不需要 reauthenticate，不需要 sudo token，
 * 仅需验证码确认用户拥有邮箱访问权。
 */
export async function modifyPassword(
  userAccessToken: string,
  newPassword: string,
  verifyCode: string,
  verificationId: string
): Promise<{ success: boolean; message: string }> {
  const parsed = parseAccessToken(userAccessToken)
  if (!parsed?.uid) {
    return { success: false, message: "无法获取用户信息，请重新登录" }
  }

  const uid = parsed.uid
  const envId = process.env.CLOUDBASE_ENV_ID || (app as any).config?.env || ""
  const cfg = (app as any).config || {}

  // Step 1: 验证验证码
  try {
    const adminToken = await getAdminToken()
    const verifyResult = await authApi(
      "/verification/verify",
      { verification_id: verificationId, verification_code: verifyCode },
      adminToken
    )
    if (verifyResult.statusCode !== 200 || !verifyResult.body?.verification_token) {
      const rawMsg = verifyResult.body?.error_description || "验证码错误或已过期"
      return { success: false, message: rawMsg.replace(/%!\(EXTRA.*?\)/, "").trim() }
    }
  } catch (err: any) {
    return { success: false, message: `验证码校验失败: ${err.message}` }
  }

  // Step 2: 调用腾讯云 ModifyUser API 修改密码
  try {
    const result = await callTencentCloudAPI(
      "ModifyUser",
      {
        EnvId: envId,
        Uid: uid,
        Password: newPassword,
      },
      {
        secretId: cfg.secretId || process.env.TENCENTCLOUD_SECRETID || "",
        secretKey: cfg.secretKey || process.env.TENCENTCLOUD_SECRETKEY || "",
      }
    )

    // 检查响应
    const body = result.body
    if (result.status === 200 && body?.Response && !body?.Response?.Error) {
      return { success: true, message: "密码修改成功，请使用新密码重新登录" }
    }

    const errMsg =
      body?.Response?.Error?.Message ||
      body?.Response?.Error?.Code ||
      JSON.stringify(body)
    return { success: false, message: errMsg }
  } catch (err: any) {
    return { success: false, message: `密码修改失败: ${err.message}` }
  }
}

// ============================================================
// 向后兼容的旧函数
// ============================================================

/**
 * @deprecated 请使用 sendPasswordChangeCode(userAccessToken) 代替
 */
export async function sendResetPasswordCode(email: string) {
  return sendVerificationCode(email, "signup")
}

/**
 * @deprecated 请使用 modifyPassword(userAccessToken, newPassword, verifyCode, verificationId) 代替
 */
export async function resetPassword(
  userAccessToken: string,
  newPassword: string,
  verifyCode: string
): Promise<{ success: boolean; message: string }> {
  return modifyPassword(userAccessToken, newPassword, verifyCode, "")
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
