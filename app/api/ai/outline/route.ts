/**
 * POST /api/ai/outline
 * 根据游戏名称和简介，调用千问 AI 生成故事大纲
 * Body: { name, description, chapterCount? }
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, description, chapterCount } = await request.json();
    if (!name || !description) {
      return NextResponse.json({ success: false, message: "请提供游戏名称和简介" }, { status: 400 });
    }

    const count = chapterCount || 8;
    const prompt = `你是一位资深的 Galgame 视觉小说编剧。请根据以下游戏信息，生成一份完整的${count}章故事大纲。

游戏名称：《${name}》
游戏简介：${description}

要求：
- 输出格式：每章用【第X章：标题】开头，然后一段剧情概述（2-3句话）
- ${count}章结构，章节之间情节递进，有起承转合
- 包含2-3个关键分支点（标注在对应章节末尾）
- 语言风格：有文学感，贴合剧情基调
- 内容要详尽充实，不要省略`;

    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_TEXT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: "system", content: "你是一位资深的 Galgame 视觉小说编剧，擅长创作引人入胜的故事大纲。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 4096,
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "调用失败");
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/\n{3,}/g, "\n\n").trim();

    return NextResponse.json({ success: true, outline: cleaned });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
