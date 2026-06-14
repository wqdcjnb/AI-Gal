/**
 * CloudBase Auth Admin API 内部工具
 * 封装带 admin 签名的 HTTP 请求
 */
import app from "@/lib/cloudbase";

/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
const { request: cloudbaseRequest } = require("@cloudbase/node-sdk/dist/utils/tcbopenapicommonrequester");

const AUTH_API_BASE = "/auth/v1";

interface ApiResult { statusCode: number; body: any }

export async function authApi(
  path: string,
  data: Record<string, any>,
  accessToken?: string,
  method: "POST" | "PATCH" = "POST"
): Promise<ApiResult> {
  return cloudbaseRequest({
    config: (app as any).config,
    method,
    path: `${AUTH_API_BASE}${path}`,
    data,
    headers: { "content-type": "application/json" },
    token: accessToken || undefined,
  });
}

export async function getAdminToken(): Promise<string> {
  const result = await authApi("/token/clientCredential", { grant_type: "client_credentials" });
  if (result.statusCode !== 200 || !result.body?.access_token) {
    throw new Error("获取 CloudBase Admin Token 失败");
  }
  return result.body.access_token;
}

/** 用户级 Auth API（直接 HTTP，不走 admin 签名） */
export async function userAuthApi(
  path: string,
  data: any,
  userAccessToken: string,
  method = "POST"
) {
  const envId = process.env.CLOUDBASE_ENV_ID || (app as any).config?.env || "";
  const url = `https://${envId}.api.tcloudbasegateway.com/auth/v1${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userAccessToken}`,
    },
    body: JSON.stringify(data),
  });

  const text = await res.text();
  if (!text || text.trim() === "") return {};
  return JSON.parse(text);
}
