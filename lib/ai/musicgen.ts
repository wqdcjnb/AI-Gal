/**
 * MusicGen 文生音乐客户端
 * 通过 Hugging Face Inference API 调用 facebook/musicgen-small
 */
const HF_MODEL = "facebook/musicgen-small";

interface MusicGenParams {
  prompt: string;
  duration?: number; // 秒（默认 10）
}

/**
 * 根据文字描述生成 BGM
 * 返回 WAV 音频的 ArrayBuffer
 */
export async function generateMusic(params: MusicGenParams): Promise<ArrayBuffer> {
  const { prompt, duration = 10 } = params;

  // MusicGen 每 50 tokens ≈ 1 秒
  const maxNewTokens = Math.min(Math.round(duration * 50), 1500);

  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          do_sample: true,
          guidance_scale: 3.0,
          max_new_tokens: maxNewTokens,
        },
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    // 模型加载中（冷启动）
    if (res.status === 503) {
      const estimated = JSON.parse(text).estimated_time || 60;
      throw new Error(`模型加载中，预计等待 ${Math.round(estimated)} 秒，请稍后重试`);
    }
    throw new Error(`MusicGen 生成失败: ${text}`);
  }

  return res.arrayBuffer();
}
