/**
 * 用户登录（密码登录 / 验证码登录）
 */
import { getAdminToken, authApi } from "./admin-api";

/** 密码登录 */
export async function loginWithPassword(email: string, password: string): Promise<{
  success: boolean; accessToken?: string; refreshToken?: string; uid?: string; message: string;
}> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi("/signin", { username: email, password }, adminToken);
    if (result.statusCode === 200) {
      return {
        success: true,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "登录成功",
      };
    }
    return { success: false, message: result.body?.error_description || result.body?.message || "邮箱或密码不正确" };
  } catch { return { success: false, message: "登录失败，请稍后重试" }; }
}

/** 验证码登录 */
export async function loginWithCode(
  email: string, verificationCode: string, verificationId: string
): Promise<{
  success: boolean; accessToken?: string; refreshToken?: string; uid?: string; message: string;
}> {
  try {
    const adminToken = await getAdminToken();

    // Step 1: 验证验证码
    const verifyResult = await authApi("/verification/verify", {
      verification_id: verificationId,
      verification_code: verificationCode,
    }, adminToken);

    if (verifyResult.statusCode !== 200 || !verifyResult.body?.verification_token) {
      const msg = (verifyResult.body?.error_description || "验证码错误").replace(/%!\(EXTRA.*?\)/, "").trim();
      return { success: false, message: msg };
    }

    // Step 2: 用 verification_token 登录
    const result = await authApi("/signin", {
      verification_token: verifyResult.body.verification_token,
    }, adminToken);

    if (result.statusCode === 200) {
      return {
        success: true,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "登录成功",
      };
    }
    return { success: false, message: result.body?.error_description || result.body?.message || "登录失败" };
  } catch { return { success: false, message: "登录失败，请稍后重试" }; }
}
