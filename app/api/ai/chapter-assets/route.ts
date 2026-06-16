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

    // TODO: 待网络恢复后接入真实 AI API（千问/DeepSeek）
    // const data = await fetch("https://dashscope.aliyuncs.com/...", { ... })

    // 先返回 mock 数据跑通 UI
    const mockAssets = {
      characters: [
        { name: "主角", role: "玩家角色", spriteDesc: "校服，短发，略显稚嫩的面庞，眼神坚定" },
        { name: "神秘少女", role: "关键角色", spriteDesc: "白色连衣裙，长发及腰，面带神秘的微笑，袖口绣有花纹" },
      ],
      backgrounds: [
        { scene: "校园门口", desc: "春日傍晚，夕阳将天空染成橙红色，校门口的樱花树正盛开，花瓣随风飘落" },
        { scene: "空教室", desc: "黄昏时分，空无一人的教室，黑板上有未擦的粉笔字，窗外传来远处社团活动的喧闹声" },
      ],
      bgm: [
        { mood: "温馨", desc: "轻柔的钢琴独奏，节奏舒缓，带有些许怀旧感，音量适中" },
        { mood: "紧张", desc: "弦乐渐强，低音提琴拨弦，节奏加快，营造不安的氛围" },
      ],
      cg: [
        { trigger: "少女在樱花树下回头", desc: "樱花树下的特写镜头，夕阳逆光，少女回眸露出温柔的微笑，背景虚化成粉色光斑" },
      ],
    };

    return NextResponse.json({ success: true, assets: mockAssets });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "生成失败" }, { status: 500 });
  }
}
