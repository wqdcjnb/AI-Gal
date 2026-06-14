/**
 * Token 解析 & 刷新
 */
import { getAdminToken, authApi } from "./admin-api";

/** 从 JWT access_token 解析用户信息 */
export function parseAccessToken(token: string): { email: string; uid: string } | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"));
    const uid = payload.sub || payload.uid || "";
    const email = payload.email || "";
    if (!uid) return null;
    return { uid, email };
  } catch { return null; }
}

/** 刷新 access_token */
export async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean; accessToken?: string; message: string;
}> {
  try {
    const adminToken = await getAdminToken();
    const result = await authApi("/token", {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }, adminToken);
    if (result.statusCode === 200 && result.body?.access_token) {
      return { success: true, accessToken: result.body.access_token, message: "Token 已刷新" };
    }
    return { success: false, message: result.body?.error_description || "Token 刷新失败" };
  } catch { return { success: false, message: "Token 刷新失败" }; }
}
