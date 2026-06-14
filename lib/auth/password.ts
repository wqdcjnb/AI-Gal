/**
 * 用户密码修改
 */
import app from "@/lib/cloudbase";
import { getAdminToken, authApi } from "./admin-api";
import { parseAccessToken } from "./token";
import { sendVerificationCode } from "./verification";
import { validatePasswordStrength } from "./validate";
import { callTencentCloudAPI } from "./tc3";

/** 发送修改密码验证码 */
export async function sendPasswordChangeCode(userAccessToken: string): Promise<{
  success: boolean; verificationId?: string; expiresIn?: number; message: string;
}> {
  const parsed = parseAccessToken(userAccessToken);
  if (!parsed?.email) return { success: false, message: "无法获取账号邮箱" };
  return sendVerificationCode(parsed.email);
}

/** 修改密码（验证码 + TC3 ModifyUser API） */
export async function modifyPassword(
  userAccessToken: string, newPassword: string, verifyCode: string, verificationId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const parsed = parseAccessToken(userAccessToken);
    if (!parsed?.uid) return { success: false, message: "无法获取用户信息" };

    // Step 1: 验证验证码
    const adminToken = await getAdminToken();
    const verifyResult = await authApi("/verification/verify", {
      verification_id: verificationId,
      verification_code: verifyCode,
    }, adminToken);

    if (verifyResult.statusCode !== 200 || !verifyResult.body?.verification_token) {
      const msg = (verifyResult.body?.error_description || "验证码错误").replace(/%!\(EXTRA.*?\)/, "").trim();
      return { success: false, message: msg };
    }

    // Step 2: 调用腾讯云 ModifyUser API
    const cfg = (app as any).config || {};
    const envId = process.env.CLOUDBASE_ENV_ID || cfg.env || "";

    const result = await callTencentCloudAPI("ModifyUser", {
      EnvId: envId,
      Uid: parsed.uid,
      Password: newPassword,
    }, {
      secretId: cfg.secretId || process.env.TENCENTCLOUD_SECRETID || "",
      secretKey: cfg.secretKey || process.env.TENCENTCLOUD_SECRETKEY || "",
    });

    if (result.status === 200 && result.body?.Response && !result.body?.Response?.Error) {
      return { success: true, message: "密码修改成功，请使用新密码重新登录" };
    }
    return { success: false, message: result.body?.Response?.Error?.Message || "密码修改失败" };
  } catch { return { success: false, message: "密码修改失败，请稍后重试" }; }
}

// ===== 弃用兼容 =====
/** @deprecated */
export async function sendResetPasswordCode(email: string) {
  return sendVerificationCode(email);
}
/** @deprecated */
export async function resetPassword(
  userAccessToken: string, newPassword: string, verifyCode: string
): Promise<{ success: boolean; message: string }> {
  return modifyPassword(userAccessToken, newPassword, verifyCode, "");
}
