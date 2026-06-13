"use client"

import { Card } from "@/components/ui/card"
import {
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
  Globe,
  Heart,
} from "lucide-react"

const highlights = [
  {
    icon: Sparkles,
    title: "全 AI 驱动",
    description:
      "角色立绘、剧情文本、场景背景、BGM 均由 AI 生成，你也可以随时手动编辑调整每一项内容。",
  },
  {
    icon: Globe,
    title: "在线实时预览",
    description:
      "网页模拟 Ren'Py 原生游玩界面，底部对话框、立绘展示、背景切换、选项弹窗一应俱全。",
  },
  {
    icon: Zap,
    title: "零代码零门槛",
    description:
      "无需学习 Python 或 Ren'Py 脚本语法，可视化界面完成所有操作，专注创作本身。",
  },
  {
    icon: Users,
    title: "社区素材共享",
    description:
      "公共素材库汇集创作者公开的角色、背景、BGM，一键引用到自己的项目，加速创作。",
  },
  {
    icon: ShieldCheck,
    title: "内容安全风控",
    description:
      "全内容 AI 鉴黄鉴暴过滤，确保所有生成内容合规，杜绝违规 Galgame 的创建与传播。",
  },
  {
    icon: Heart,
    title: "永久免费无限制",
    description:
      "平台完全免费，所有功能向所有注册用户开放，无会员、无付费墙、无导出次数限制。",
  },
]

const Highlight = () => {
  return (
    <div className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3 text-purple-500" />
          为什么选择 AI-Gal
        </div>
        <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-semibold tracking-tight">
          让每个人都能
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {" "}创造故事
          </span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          我们相信创作不应有门槛。AI-Gal 为你提供从灵感到成品的一切工具
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map((item) => (
          <Card
            key={item.title}
            className="p-6 border rounded-xl hover:shadow-md transition-shadow"
          >
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4">
              <item.icon className="h-5 w-5 text-purple-500" />
            </div>
            <h4 className="font-semibold text-base">{item.title}</h4>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Highlight
