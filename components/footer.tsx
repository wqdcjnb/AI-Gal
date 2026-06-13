import { Separator } from "@/components/ui/separator"
import { Github, Twitter, Globe, Heart } from "lucide-react"
import Link from "next/link"

const footerSections = [
  {
    title: "产品",
    links: [
      { title: "功能介绍", href: "#features" },
      { title: "作品广场", href: "/gallery" },
      { title: "帮助教程", href: "/help" },
      { title: "更新日志", href: "#" },
    ],
  },
  {
    title: "资源",
    links: [
      { title: "Ren'Py 官网", href: "https://renpy.org" },
      { title: "使用教程", href: "/help" },
      { title: "常见问题", href: "#faq" },
      { title: "公共素材库", href: "/gallery" },
    ],
  },
  {
    title: "社区",
    links: [
      { title: "作品广场", href: "/gallery" },
      { title: "GitHub", href: "#" },
      { title: "反馈建议", href: "#" },
      { title: "联系我们", href: "#" },
    ],
  },
  {
    title: "法律",
    links: [
      { title: "服务条款", href: "#" },
      { title: "隐私政策", href: "#" },
      { title: "Cookie 政策", href: "#" },
      { title: "内容规范", href: "#" },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="mt-12 xs:mt-20 dark bg-background border-t">
      <div className="max-w-(--breakpoint-xl) mx-auto py-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-8 gap-y-10 px-6">
        <div className="col-span-full lg:col-span-1">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AG</span>
            </div>
            <span className="font-semibold">AI-Gal</span>
          </Link>

          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            AI 驱动的 Galgame 在线制作平台。
            <br />
            零代码 · 全免费 · 一键导出。
          </p>

          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
            <Heart className="h-3 w-3 text-red-500" />
            用爱制作 · 为创作者而生
          </p>
        </div>

        {footerSections.map(({ title, links }) => (
          <div key={title}>
            <h6 className="font-semibold text-foreground text-sm">{title}</h6>
            <ul className="mt-4 space-y-3">
              {links.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Separator />
      <div className="max-w-(--breakpoint-xl) mx-auto py-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-x-2 gap-y-5 px-6">
        {/* Copyright */}
        <span className="text-muted-foreground text-sm text-center xs:text-start">
          &copy; {new Date().getFullYear()} AI-Gal. All rights reserved.
        </span>

        <div className="flex items-center gap-5 text-muted-foreground">
          <Link href="#" target="_blank" className="hover:text-foreground transition-colors">
            <Twitter className="h-4 w-4" />
          </Link>
          <Link href="#" target="_blank" className="hover:text-foreground transition-colors">
            <Github className="h-4 w-4" />
          </Link>
          <Link href="#" target="_blank" className="hover:text-foreground transition-colors">
            <Globe className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
