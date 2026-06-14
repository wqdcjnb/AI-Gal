/**
 * 邮箱验证码发送
 */
import { getAdminToken, authApi } from "./admin-api";

export async function sendVerificationCode(
  email: string,
  type: "signup" | "signin" = "signup"
): Promise<{ success: boolean; verificationId?: string; expiresIn?: number; message: string }> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi("/verification", { email, type }, adminToken);
    if (result.statusCode === 200 && result.body?.verification_id) {
      return {
        success: true,
        verificationId: result.body.verification_id,
        expiresIn: result.body.expires_in || 600,
        message: "验证码已发送到您的邮箱",
      };
    }
    return { success: false, message: result.body?.error_description || "发送验证码失败" };
  } catch { return { success: false, message: "发送验证码失败，请稍后重试" }; }
}
