/**
 * POST /api/ai/chapter-assets
 * 根据大纲和章节信息，AI 分析并生成该章所需的资产描述 JSON
 * Body: { projectInfo: { name, description, tags, worldSetting }, chapter: { title, summary } }
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { projectInfo, chapter } = await request.json();
    if (!chapter?.title) {
      return NextResponse.json({ success: false, message: "请提供章节信息" }, { status: 400 });
    }

    const prompt = `你是一位 Galgame 视觉小说的艺术总监。请根据以下信息分析当前章节需要的美术和音频资产，输出 JSON。

## 游戏信息
名称：《${projectInfo?.name || ""}》
简介：${projectInfo?.description || ""}
标签：${(projectInfo?.tags || []).join("、")}
世界观/大纲：${(projectInfo?.worldSetting || "").slice(0, 500)}

## 当前章节
标题：${chapter.title || ""}
概要：${chapter.summary || ""}

## 风格约束（非常重要）
- 所有人物立绘、背景、CG 必须是**日式二次元动漫风格**（Anime / Galgame 风格），大眼睛、精致线条、柔和上色
- 所有 BGM 必须是**纯音乐/器乐**（无人声），单曲时长控制在 **30-90 秒**，适合循环播放
- CG 画面描述控制在一帧画面内，不要描述长动画序列

## 输出要求
返回纯 JSON，不要 markdown 代码块：
{
  "characters": [{ "name": "角色名", "role": "身份", "spriteDesc": "立绘描述（二次元风格 - 服装、发型、表情、姿态）" }],
  "backgrounds": [{ "scene": "场景名", "desc": "场景画面描述（二次元风格 - 时间、地点、氛围、光线、色调）" }],
  "bgm": [{ "mood": "情绪标签", "desc": "纯音乐描述（乐器、风格、节奏、情绪，30-90秒）" }],
  "cg": [{ "trigger": "触发时机", "desc": "CG画面描述（二次元风格单帧 - 构图、人物、光影、色调）" }]
}`;

    const res = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DASHSCOPE_TEXT_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [
          { role: "system", content: "你是一位 Galgame 艺术总监。只输出纯 JSON，不要 markdown 代码块，不要额外解释。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "调用失败");
    const content = data.choices?.[0]?.message?.content || "";
    const cleaned = content.replace(/```json\n?|```/g, "").trim();
    const assets = JSON.parse(cleaned);
    return NextResponse.json({ success: true, assets });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
