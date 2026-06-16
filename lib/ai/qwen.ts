/**
 * 千问 / 通义万相 AI 客户端
 * 通过阿里云 DashScope API 调用
 *
 * 生图: POST /api/v1/services/aigc/text2image/image-synthesis
 * 配音: POST /api/v1/services/audio/tts/customization (音色设计/克隆)
 */
const BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services";

const apiKey = () => process.env.DASHSCOPE_API_KEY!;

/** 调用 DashScope API */
async function callDashScope(path: string, body: Record<string, any>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.code && data.message) {
    throw new Error(data.message);
  }
  return data;
}

// ============================================================
// 文生图
// ============================================================

interface ImageGenParams {
  prompt: string;       // 图片描述
  size?: string;        // 默认 "1024*1024"
  n?: number;           // 生成数量，默认 1
}

interface ImageGenResult {
  url: string;          // 临时下载链接
}

/**
 * 文生图 — 调用通义万相 2.5
 * 返回图片 URL 列表
 */
export async function generateImage(params: ImageGenParams): Promise<ImageGenResult[]> {
  const { prompt, size = "1024*1024", n = 1 } = params;

  const data = await callDashScope("/aigc/text2image/image-synthesis", {
    model: "wanxiang-v2.5",
    input: { prompt },
    parameters: { size, n, seed: Math.floor(Math.random() * 2147483647) },
  });

  // DashScope 返回格式
  const results = data.output?.results || [];
  return results.map((r: any) => ({ url: r.url }));
}

// ============================================================
// 语音合成 / 角色配音
// ============================================================

interface VoiceDesignParams {
  prompt: string;           // 音色描述，如 "沉稳的中年男性播音员，音色低沉..."
  previewText: string;      // 预览文本
  name: string;             // 音色名称（自定义）
}

interface VoiceDesignResult {
  voiceName: string;        // 分配的音色名称
  audioUrl: string;         // Base64 编码的预览音频
}

/**
 * 音色设计 — 用文字描述创造新音色，返回预览音频
 */
export async function designVoice(params: VoiceDesignParams): Promise<VoiceDesignResult> {
  const { prompt, previewText, name } = params;

  const data = await callDashScope("/audio/tts/customization", {
    model: "qwen-voice-design",
    input: {
      action: "create",
      target_model: "qwen3-tts-vd-realtime-2025-12-16",
      voice_prompt: prompt,
      preview_text: previewText,
      preferred_name: name,
      language: "zh",
    },
    parameters: { sample_rate: 24000, response_format: "wav" },
  });

  return {
    voiceName: data.output?.voice_name || name,
    audioUrl: data.output?.audio || "",
  };
}

interface VoiceCloneParams {
  audioBase64: string;      // 3秒音频样本的 Base64
  name: string;             // 克隆音色名称
}

/**
 * 音色克隆 — 从 3 秒音频样本复刻人声
 */
export async function cloneVoice(params: VoiceCloneParams): Promise<{ voiceName: string }> {
  const { audioBase64, name } = params;

  const data = await callDashScope("/audio/tts/customization", {
    model: "qwen-voice-enrollment",
    input: {
      action: "create",
      target_model: "qwen3-tts-vc-realtime-2025-11-27",
      preferred_name: name,
      audio: { data: `data:audio/mpeg;base64,${audioBase64}` },
    },
  });

  return { voiceName: data.output?.voice_name || name };
}

interface SpeechParams {
  text: string;
  voiceName: string;        // 之前设计/克隆得到的音色名称
}

/**
 * 文字转语音 — 用已设计的音色朗读文字，返回 Base64 音频
 */
export async function textToSpeech(params: SpeechParams): Promise<string> {
  const { text, voiceName } = params;

  const data = await callDashScope("/audio/tts/customization", {
    model: "qwen3-tts-vd-realtime-2025-12-16",
    input: {
      action: "synthesize",
      voice_name: voiceName,
      text,
    },
    parameters: { sample_rate: 24000, response_format: "mp3" },
  });

  return data.output?.audio || ""; // Base64 编码的音频
}
