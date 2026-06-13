import { Button } from "@/components/ui/button"
import { ArrowUpRight, Heart, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

const CTASection = () => {
  return (
    <div className="max-w-(--breakpoint-xl) mx-auto w-full py-12 xs:py-20 px-6">
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 p-8 sm:p-12 lg:p-16 text-center">
        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 mb-6">
            <Heart className="h-3 w-3" />
            永久免费 · 无限制
          </div>

          <h2 className="text-3xl xs:text-4xl md:text-5xl font-semibold tracking-tight max-w-2xl mx-auto">
            准备好
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {" "}创造你的故事{" "}
            </span>
            了吗？
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto text-lg">
            无需编程，无需付费，打开浏览器即可开始。AI 将陪伴你完成从灵感构思到游戏成品的全过程。
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none shadow-lg shadow-purple-500/25"
              asChild
            >
              <Link href="/dashboard/projects/new">
                <Zap className="h-5! w-5!" />
                立即免费开始
                <ArrowUpRight className="h-5! w-5!" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full text-base shadow-none"
              asChild
            >
              <Link href="/help">
                <Sparkles className="h-5! w-5!" />
                查看使用教程
              </Link>
            </Button>
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { icon: Sparkles, text: "AI驱动创作" },
              { icon: Heart, text: "永久免费" },
              { icon: Zap, text: "一键导出Ren'Py" },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
              >
                <item.icon className="h-4 w-4 text-purple-500" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CTASection
