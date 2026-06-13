import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/components/auth-provider";
import { ProjectProvider } from "@/components/project/project-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI-Gal - AI驱动的Galgame在线制作平台",
  description:
    "零代码可视化网站，借助 AI 一键生成角色、剧本、CG、BGM，在线预览后自动生成规范 Ren'Py 工程压缩包。",
  keywords: [
    "AI-Gal",
    "Galgame制作",
    "AI游戏制作",
    "RenPy",
    "视觉小说",
    "AI绘图",
    "AI编剧",
    "免费游戏制作",
    "在线游戏制作",
    "二次元游戏",
  ],
  openGraph: {
    type: "website",
    siteName: "AI-Gal",
    locale: "zh_CN",
    url: "https://ai-gal.com",
    title: "AI-Gal - AI驱动的Galgame在线制作平台",
    description:
      "零代码可视化网站，借助 AI 一键生成角色、剧本、CG、BGM，在线预览后自动生成规范 Ren'Py 工程压缩包。",
  },
  authors: [
    {
      name: "AI-Gal Team",
    },
  ],
  creator: "AI-Gal",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "icon", type: "image/png", url: "/favicon-32x32.png", sizes: "32x32" },
    { rel: "icon", type: "image/png", url: "/favicon-16x16.png", sizes: "16x16" },
    { rel: "icon", type: "image/png", url: "/android-chrome-192x192.png", sizes: "192x192" },
    { rel: "icon", type: "image/png", url: "/android-chrome-512x512.png", sizes: "512x512" },
  ],
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <ProjectProvider>{children}</ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
