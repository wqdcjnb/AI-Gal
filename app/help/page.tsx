"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  BookOpen,
  Download,
  FileText,
  HelpCircle,
  Play,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react"

const tutorialCategories = [
  {
    title: "快速入门",
    icon: Play,
    items: [
      {
        q: "如何创建第一个 Galgame 项目？",
        a: "登录后进入「工作台」，点击「新建项目」按钮。填写游戏名称、简介、选择分类和篇幅后，AI 可帮你生成世界观设定。保存后即可进入角色生成步骤，开始你的创作之旅。",
      },
      {
        q: "制作一个 Galgame 需要几步？",
        a: "AI-Gal 将创作流程分为 6 个步骤：① 项目基础配置 → ② AI 角色生成 → ③ 剧情大纲 → ④ 对话&分支编辑 → ⑤ 背景 CG 生成 → ⑥ BGM 音效配置。完成所有步骤后即可预览和导出。",
      },
      {
        q: "需要编程知识吗？",
        a: "完全不需要！AI-Gal 是零代码可视化平台，所有操作都在网页上通过表单、拖拽和按钮完成。AI 会自动将你的创作内容转换为 Ren'Py 引擎可识别的脚本代码。",
      },
    ],
  },
  {
    title: "AI 功能使用",
    icon: Sparkles,
    items: [
      {
        q: "AI 可以生成什么内容？",
        a: "AI 可以帮你生成：① 世界观设定文案 ② 角色人设描述 ③ 角色立绘（日式二次元画风）④ 章节大纲 ⑤ 旁白和角色对话 ⑥ 场景背景 CG ⑦ BGM 背景音乐和音效。所有 AI 生成的内容都可以手动编辑修改。",
      },
      {
        q: "对 AI 生成的结果不满意怎么办？",
        a: "你可以：① 单段/单张重新生成 ② 调整输入的关键词和参数 ③ 直接手动编辑文案 ④ 上传自己的图片/音频替换 AI 生成的素材。AI 是辅助工具，你拥有完全的创作控制权。",
      },
      {
        q: "AI 生成需要多长时间？",
        a: "单张角色立绘通常需要 15-25 秒，整章对话生成约 10-15 秒，世界观设定生成约 5 秒。具体时间取决于服务器负载和生成内容复杂度。",
      },
    ],
  },
  {
    title: "导出与 Ren'Py",
    icon: Download,
    items: [
      {
        q: "如何导出游戏并在 Ren'Py 中运行？",
        a: "在项目编辑器中进入「导出」页面，点击「开始导出」，系统会自动整理素材并生成标准 Ren'Py 工程文件。下载 ZIP 压缩包后：1) 安装 Ren'Py 引擎 2) 解压到 Ren'Py 的 projects 目录 3) 打开 Ren'Py Launcher 即可看到并运行你的游戏。",
      },
      {
        q: "导出的游戏支持什么平台？",
        a: "导出的标准 Ren'Py 工程支持 Windows、macOS、Linux。你还可以使用 Ren'Py 自带的打包功能将游戏发布到 Steam、itch.io 等平台。",
      },
      {
        q: "导出有次数限制吗？",
        a: "完全没有！AI-Gal 完全免费，所有用户可无限制导出，无素材分辨率限制，无任何付费墙。",
      },
    ],
  },
  {
    title: "账号与项目",
    icon: UserRound,
    items: [
      {
        q: "项目数据会丢失吗？",
        a: "所有项目数据云端自动保存、永久存储。你也可以在导出页面下载项目 ZIP 到本地备份。",
      },
      {
        q: "可以多人协作吗？",
        a: "目前 AI-Gal 为单人创作模式。你可以将项目分享到作品广场供他人试玩和引用素材，但不能多人同时编辑同一项目。",
      },
      {
        q: "如何公开分享我的作品？",
        a: "在项目设置中开启「公开分享」，你的项目就会出现在作品广场。公开作品需要通过内容审核确保合规。",
      },
    ],
  },
]

export default function HelpPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <div className="max-w-(--breakpoint-xl) mx-auto py-12 px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              <HelpCircle className="h-3 w-3 text-purple-500" />
              帮助中心
            </div>
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-semibold tracking-tight mb-3">
              如何使用
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {" "}AI-Gal
              </span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              从零开始学习使用 AI-Gal 创建你的第一款 Galgame
            </p>
          </div>

          {/* Tutorial Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {tutorialCategories.map((category) => (
              <Card key={category.title} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center">
                      <category.icon className="h-4 w-4 text-purple-500" />
                    </div>
                    <h3 className="font-semibold">{category.title}</h3>
                  </div>
                  <Accordion type="single" collapsible className="space-y-1">
                    {category.items.map((item, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`${category.title}-${idx}`}
                        className="border-none"
                      >
                        <AccordionTrigger className="text-sm py-2 hover:no-underline">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-2">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            {[
              { icon: BookOpen, label: "Ren'Py 安装教程", desc: "下载和安装最新版 Ren'Py 引擎" },
              { icon: FileText, label: "ZIP 导入教程", desc: "如何将导出的压缩包导入 Ren'Py" },
              { icon: Settings, label: "高级设置说明", desc: "options.rpy 配置文件详解" },
            ].map((link) => (
              <Card key={link.label} className="hover:shadow-md transition-shadow cursor-pointer p-5">
                <link.icon className="h-5 w-5 text-purple-500 mb-3" />
                <h4 className="font-medium text-sm">{link.label}</h4>
                <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
