/**
 * 腾讯云 API TC3-HMAC-SHA256 签名工具
 * 用于调用 ModifyUser 等管理 API
 */
import crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

export async function callTencentCloudAPI(
  action: string,
  params: Record<string, any>,
  config: { secretId: string; secretKey: string; region?: string }
): Promise<any> {
  const region = config.region || "ap-shanghai";
  const service = "tcb";
  const host = "tcb.tencentcloudapi.com";
  const version = "2018-06-08";
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

  const body = JSON.stringify(params);
  const hashedPayload = sha256(body);

  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const canonicalRequest = ["POST", "/", "", canonicalHeaders, signedHeaders, hashedPayload].join("\n");

  const credentialScope = `${date}/${service}/tc3_request`;
  const hashedCanonicalRequest = sha256(canonicalRequest);
  const stringToSign = ["TC3-HMAC-SHA256", String(timestamp), credentialScope, hashedCanonicalRequest].join("\n");

  const secretDate = hmacSha256(Buffer.from(`TC3${config.secretKey}`, "utf-8"), date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, "tc3_request");
  const signature = hmacSha256(secretSigning, stringToSign).toString("hex");

  const authorization = `TC3-HMAC-SHA256 Credential=${config.secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}/`, {
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
  });

  const text = await res.text();
  let result: any;
  try { result = JSON.parse(text); } catch { result = { raw: text }; }
  return { status: res.status, body: result };
}
