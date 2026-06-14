/**
 * 用户注册
 */
import { getAdminToken, authApi } from "./admin-api";

export async function registerUser(
  email: string, password: string, verificationCode: string, verificationId: string
): Promise<{
  success: boolean; username?: string; accessToken?: string;
  refreshToken?: string; uid?: string; message: string;
}> {
  try {
    const username = "u" + Date.now().toString().slice(-8);
    const adminToken = await getAdminToken();
    const result = await authApi("/signup", {
      username, email, password,
      verification_code: verificationCode,
      verification_id: verificationId,
    }, adminToken);

    if (result.statusCode === 200 || result.statusCode === 201) {
      return {
        success: true, username,
        accessToken: result.body?.access_token,
        refreshToken: result.body?.refresh_token,
        uid: result.body?.sub || result.body?.uid || email,
        message: "注册成功",
      };
    }
    return { success: false, message: result.body?.error_description || result.body?.message || "注册失败" };
  } catch { return { success: false, message: "注册失败，请稍后重试" }; }
}
