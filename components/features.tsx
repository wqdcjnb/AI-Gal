import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  UserRound,
  BookOpen,
  MessageSquare,
  Image,
  Music,
  Download,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: UserRound,
    step: "Step 1",
    title: "AI 角色生成",
    description:
      "输入姓名与性格标签，AI 自动生成人设文案和日式二次元立绘。支持正装、日常、Q 版及多种表情差分。",
  },
  {
    icon: BookOpen,
    step: "Step 2",
    title: "智能剧情大纲",
    description:
      "提供核心梗概，AI 自动拆分全本章节大纲、关键剧情节点与分支触发条件。可视化拖拽调整章节顺序。",
  },
  {
    icon: MessageSquare,
    step: "Step 3",
    title: "对话 & 分支编辑",
    description:
      "AI 批量生成旁白与角色对话，支持语气调节。可视化制作分支选项，设置跳转目标实现多结局。",
  },
  {
    icon: Image,
    step: "Step 4",
    title: "场景背景 CG",
    description:
      "按章节场景名 AI 生成日式插画风背景，支持室内/室外/昼夜多版本，也可本地上传自定义背景。",
  },
  {
    icon: Music,
    step: "Step 5",
    title: "BGM & 音效",
    description:
      "根据场景氛围（温馨/紧张/悲伤）AI 生成背景音乐和短音效，一键绑定对应章节自动播放。",
  },
  {
    icon: Download,
    step: "Step 6",
    title: "一键导出 Ren'Py",
    description:
      "自动整理素材并编译生成标准 .rpy 脚本文件，打包为 ZIP 下载，解压即可用 Ren'Py 引擎打开游玩。",
  },
]

const Features = () => {
  return (
    <div id="features" className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <Sparkles className="h-3 w-3 text-purple-500" />
          创作流程
        </div>
        <h2 className="text-3xl xs:text-4xl md:text-5xl md:leading-[3.5rem] font-semibold tracking-tight sm:max-w-2xl sm:mx-auto">
          六步完成
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {" "}Galgame{" "}
          </span>
          创作
        </h2>
        <p className="mt-3 text-muted-foreground sm:max-w-xl sm:mx-auto">
          无需编程基础，借助 AI 完成从角色设计到游戏打包的全部流程
        </p>
      </div>

      <div className="mt-12 xs:mt-16 w-full mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="flex flex-col border rounded-xl overflow-hidden shadow-none hover:shadow-md transition-shadow group"
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {feature.step}
                </span>
              </div>
              <h4 className="mt-3! text-lg font-semibold tracking-tight">
                {feature.title}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </CardHeader>
            <CardContent className="mt-auto px-0 pb-0">
              <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-40 ml-6 rounded-tl-xl border-l border-t border-border/50" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Features
