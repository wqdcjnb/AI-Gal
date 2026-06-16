/**
 * 腾讯混元大模型 API 客户端
 * 使用 TC3-HMAC-SHA256 签名，复用现有腾讯云密钥
 */
import crypto from "crypto";

function sha256(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data).digest();
}

interface ChatMessage {
  Role: "user" | "assistant" | "system";
  Content: string;
}

interface ChatParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 调用混元 ChatCompletions API
 * https://cloud.tencent.com/document/product/1729/97731
 */
export async function chatCompletion(params: ChatParams): Promise<string> {
  const { messages, model = "hunyuan-lite", temperature = 0.8, maxTokens = 2048 } = params;

  const secretId = process.env.TENCENTCLOUD_SECRETID!;
  const secretKey = process.env.TENCENTCLOUD_SECRETKEY!;
  const service = "hunyuan";
  const host = "hunyuan.tencentcloudapi.com";
  const version = "2023-09-01";
  const timestamp = Math.floor(Date.now() / 1000);
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10);

  const body = JSON.stringify({ Model: model, Messages: messages, Temperature: temperature, TopP: 0.9 });
  const hashedPayload = sha256(body);

  // Canonical Request
  const canonicalHeaders = `content-type:application/json\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const canonicalRequest = `POST\n/\n\n${canonicalHeaders}${signedHeaders}\n${hashedPayload}`;

  // String to Sign
  const credentialScope = `${date}/${service}/tc3_request`;
  const stringToSign = `TC3-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${sha256(canonicalRequest)}`;

  // Signature
  const secretDate = hmacSha256(Buffer.from(`TC3${secretKey}`, "utf-8"), date);
  const secretService = hmacSha256(secretDate, service);
  const secretSigning = hmacSha256(secretService, "tc3_request");
  const signature = hmacSha256(secretSigning, stringToSign).toString("hex");

  const authorization = `TC3-HMAC-SHA256 Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const res = await fetch(`https://${host}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": host,
      "X-TC-Action": "ChatCompletions",
      "X-TC-Version": version,
      "X-TC-Timestamp": String(timestamp),
      "X-TC-Region": "ap-guangzhou",
      "Authorization": authorization,
    },
    body,
  });

  const text = await res.text();
  const data = JSON.parse(text);

  if (data.Response?.Error) {
    throw new Error(data.Response.Error.Message || "混元 API 调用失败");
  }

  // 提取回复文本
  const choices = data.Response?.Choices || [];
  return choices[0]?.Message?.Content || "";
}
