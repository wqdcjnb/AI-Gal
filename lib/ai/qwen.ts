/**
 * 千问 / 万相 AI 客户端
 * 通过阿里云 DashScope API 调用
 *
 * 文生图 + 图生图: wan2.7-image-pro（异步）
 * 配音: qwen-voice-design / qwen3-tts 系列
 */
const BASE_URL = "https://dashscope.aliyuncs.com/api/v1/services";

const apiKey = () => process.env.DASHSCOPE_API_KEY!;

/** 调用 DashScope 异步 API */
async function callAsync(path: string, body: Record<string, any>) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data.code && data.message) {
    throw new Error(data.message);
  }
  return data;
}

/** 轮询异步任务直到完成（万相 2.7） */
async function pollTask(taskId: string): Promise<any> {
  for (let i = 0; i < 90; i++) {
    const res = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
    const data = await res.json();
    if (data.code && data.message) throw new Error(data.message);
    const status = data.output?.task_status;
    if (status === "SUCCEEDED") return data;
    if (status === "FAILED") throw new Error(data.output?.message || "任务失败");
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("任务超时");
}

// ============================================================
// 通用请求参数
// ============================================================

interface ImageGenParams {
  prompt: string;
  size?: string;           // 默认 "2K"，支持 "1K"|"2K"|"4K" 或 "1024*1024"
  n?: number;              // 1-4，默认 4
  referenceImage?: string; // base64 data URL 或公网 URL
}

interface ImageGenResult {
  url: string;
}

/**
 * 文生图 / 图生图 — 万相 2.7 统一接口
 * 有 referenceImage 走图像编辑（图生图），否则走文生图
 */
export async function generateImage(params: ImageGenParams): Promise<ImageGenResult[]> {
  const { prompt, size = "2K", n = 4, referenceImage } = params;

  const content: any[] = [];
  if (referenceImage) {
    content.push({ image: referenceImage });
  }
  content.push({ text: prompt });

  const submit = await callAsync("/aigc/image-generation/generation", {
    model: "wan2.7-image-pro",
    input: {
      messages: [
        { role: "user", content },
      ],
    },
    parameters: { size, n, watermark: false },
  });

  const taskId = submit.output?.task_id;
  if (!taskId) throw new Error("未获取到异步任务ID");

  const data = await pollTask(taskId);
  const choices = data.output?.choices || [];
  const results: ImageGenResult[] = [];
  for (const choice of choices) {
    const list = choice?.message?.content || [];
    for (const item of list) {
      if (item.image) results.push({ url: item.image });
    }
  }
  return results;
}

// ============================================================
// 语音合成 / 角色配音
// ============================================================

interface VoiceDesignParams {
  prompt: string;
  previewText: string;
  name: string;
}

interface VoiceDesignResult {
  voiceName: string;
  audioUrl: string;
}

export async function designVoice(params: VoiceDesignParams): Promise<VoiceDesignResult> {
  const { prompt, previewText, name } = params;

  const res = await fetch(`${BASE_URL}/audio/tts/customization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
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
    }),
  });
  const data = await res.json();
  if (data.code && data.message) throw new Error(data.message);
  return {
    voiceName: data.output?.voice_name || name,
    audioUrl: data.output?.audio || "",
  };
}

interface VoiceCloneParams {
  audioBase64: string;
  name: string;
}

export async function cloneVoice(params: VoiceCloneParams): Promise<{ voiceName: string }> {
  const { audioBase64, name } = params;

  const res = await fetch(`${BASE_URL}/audio/tts/customization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen-voice-enrollment",
      input: {
        action: "create",
        target_model: "qwen3-tts-vc-realtime-2025-11-27",
        preferred_name: name,
        audio: { data: `data:audio/mpeg;base64,${audioBase64}` },
      },
    }),
  });
  const data = await res.json();
  if (data.code && data.message) throw new Error(data.message);
  return { voiceName: data.output?.voice_name || name };
}

interface SpeechParams {
  text: string;
  voiceName: string;
}

export async function textToSpeech(params: SpeechParams): Promise<string> {
  const { text, voiceName } = params;

  const res = await fetch(`${BASE_URL}/audio/tts/customization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen3-tts-vd-realtime-2025-12-16",
      input: {
        action: "synthesize",
        voice_name: voiceName,
        text,
      },
      parameters: { sample_rate: 24000, response_format: "mp3" },
    }),
  });
  const data = await res.json();
  if (data.code && data.message) throw new Error(data.message);
  return data.output?.audio || "";
}
