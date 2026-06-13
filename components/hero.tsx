import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Play, Sparkles } from "lucide-react"
import Link from "next/link"

const Hero = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center overflow-hidden border-b border-accent">
      <div className="max-w-(--breakpoint-xl) w-full flex flex-col lg:flex-row mx-auto items-center justify-between gap-y-14 gap-x-10 px-6 py-12 lg:py-0">
        <div className="max-w-xl">
          <Badge className="rounded-full py-1.5 px-4 border-none bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-foreground gap-2">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" />
            完全免费 · 无任何限制
          </Badge>
          <h1 className="mt-6 max-w-[20ch] text-3xl xs:text-4xl sm:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.15]! tracking-tight">
            AI 驱动的
            <br />
            <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Galgame 制作平台
            </span>
          </h1>
          <p className="mt-6 max-w-[60ch] xs:text-lg text-muted-foreground">
            零代码可视化创作，借助 AI 一键生成角色立绘、剧情剧本、场景 CG、背景音乐。
            在线预览后自动导出为 Ren&apos;Py 工程，下载即可游玩。
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto rounded-full text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none shadow-lg shadow-purple-500/25"
              asChild
            >
              <Link href="/dashboard/projects/new">
                免费开始制作 <ArrowUpRight className="h-5! w-5!" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto rounded-full text-base shadow-none"
              asChild
            >
              <Link href="/gallery">
                <Play className="h-5! w-5!" /> 浏览作品广场
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <span className="text-foreground font-semibold">10,000+</span>{" "}
              创作者
            </div>
            <div>
              <span className="text-foreground font-semibold">50,000+</span>{" "}
              项目已创建
            </div>
            <div>
              <span className="text-foreground font-semibold">全功能</span>{" "}
              免费开放
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="relative lg:max-w-lg xl:max-w-xl w-full">
          <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 dark:from-purple-950/40 dark:via-pink-950/30 dark:to-orange-950/20 aspect-[4/3]">
            {/* Simulated Ren'Py game preview */}
            <div className="absolute inset-0 flex flex-col">
              {/* Game scene area */}
              <div className="flex-1 flex items-center justify-center relative">
                {/* Background placeholder */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-green-100 dark:from-blue-900/60 dark:to-green-900/40" />
                {/* Character silhouettes */}
                <div className="absolute bottom-0 left-1/4 w-20 h-40 bg-purple-400/60 dark:bg-purple-500/40 rounded-t-full" />
                <div className="absolute bottom-0 right-1/4 w-20 h-36 bg-pink-400/60 dark:bg-pink-500/40 rounded-t-full" />
                {/* Scene label */}
                <div className="absolute top-4 left-4 px-2 py-0.5 rounded bg-black/30 text-white text-xs backdrop-blur-sm">
                  教室 · 黄昏
                </div>
              </div>
              {/* Dialogue box */}
              <div className="h-1/3 bg-black/80 backdrop-blur-md border-t border-white/10 p-4">
                <div className="bg-black/40 rounded-lg p-3 border border-white/10">
                  <p className="text-white/90 text-sm font-semibold mb-1">
                    小樱
                  </p>
                  <p className="text-white/80 text-sm leading-relaxed">
                    &ldquo;放学后，我们能一起回家吗？今天我想去海边看看...&rdquo;
                  </p>
                </div>
                {/* Choices */}
                <div className="mt-3 space-y-1.5">
                  <div className="px-3 py-1.5 rounded-md bg-white/10 text-white/90 text-xs hover:bg-white/20 transition-colors cursor-pointer">
                    好啊，我也想去看海
                  </div>
                  <div className="px-3 py-1.5 rounded-md bg-white/10 text-white/90 text-xs hover:bg-white/20 transition-colors cursor-pointer">
                    抱歉，今天有点事...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
