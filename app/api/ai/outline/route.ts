/**
 * POST /api/ai/outline
 * 根据游戏名称和简介，调用千问 AI 生成故事大纲
 * Body: { name, description }
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name || !description) {
      return NextResponse.json({ success: false, message: "请提供游戏名称和简介" }, { status: 400 });
    }

    const prompt = `你是一位资深的 Galgame 视觉小说编剧。请根据以下游戏信息，生成一份完整的6章故事大纲。

游戏名称：《${name}》
游戏简介：${description}

要求：
- 输出格式：每章用【第X章：标题】开头，然后一段剧情概述（2-3句话）
- 6章结构：序章→发展→冲突→转折→高潮→尾声
- 包含2-3个关键分支点（标注在对应章节末尾）
- 语言风格：有文学感，贴合剧情基调
- 总字数控制在500字以内`;

    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: "system", content: "你是一位资深的 Galgame 视觉小说编剧，擅长创作引人入胜的故事大纲。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "调用失败");
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ success: true, outline: content });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
